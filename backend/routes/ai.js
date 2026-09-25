const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const tools = require('../utils/aiTools');
const nl = require('../utils/nlDates');

const router = express.Router();

const SYSTEM_PROMPT = `You are Golden Cuts' official AI grooming and booking assistant.

Your primary purpose is to help customers choose services, choose a specific barber,
understand barber specialties, check real barber schedules, find available appointment
dates and times, recommend suitable available slots, explain current service prices and
durations, and guide customers through the booking process.

Always use current application data for services, prices, barbers, specialties, schedules,
availability, and appointments by calling the provided tools. Never invent prices, barber
information, schedules, availability, or appointment details.

Always verify availability through the tools before confirming a booking. Never create an
appointment without explicit customer confirmation of the exact service, barber, date, time,
duration and price. Never reveal private information belonging to another customer. Never
expose API keys, passwords, tokens, database credentials, or internal system information.
Admin-only actions (changing prices, adding/removing services or barbers, changing schedules,
approving reviews, managing customers, viewing reports, changing settings) are never available
to the public assistant.

If required information is unavailable, clearly tell the user rather than guessing.`;

// ---------- Tool (function) definitions for the LLM tool-use loop ----------
const TOOLS = [
  { name: 'getServices', description: 'List all active services with price and duration.', input_schema: { type: 'object', properties: {} } },
  { name: 'getBarbers', description: 'List all active barbers with specialties, experience, rating.', input_schema: { type: 'object', properties: {} } },
  { name: 'getBarberByName', description: 'Find a barber by (partial) name.', input_schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
  { name: 'getBarberSchedule', description: 'Get a barber working hours/days off by barberId.', input_schema: { type: 'object', properties: { barberId: { type: 'string' } }, required: ['barberId'] } },
  { name: 'getAvailableDates', description: 'Get dates (next N days) that have at least one open slot for a barber+service duration.', input_schema: { type: 'object', properties: { barberId: { type: 'string' }, durationMinutes: { type: 'number' }, daysAhead: { type: 'number' } }, required: ['barberId', 'durationMinutes'] } },
  { name: 'getAvailableTimeSlots', description: 'Get available start times (HH:mm 24h) for a barber on a specific date for a service duration.', input_schema: { type: 'object', properties: { barberId: { type: 'string' }, date: { type: 'string' }, durationMinutes: { type: 'number' } }, required: ['barberId', 'date', 'durationMinutes'] } },
  { name: 'checkAvailability', description: 'Check if an exact barber+date+time+duration is available.', input_schema: { type: 'object', properties: { barberId: { type: 'string' }, date: { type: 'string' }, time: { type: 'string' }, durationMinutes: { type: 'number' } }, required: ['barberId', 'date', 'time', 'durationMinutes'] } },
  { name: 'getBusinessHours', description: 'Get Golden Cuts opening hours.', input_schema: { type: 'object', properties: {} } },
  { name: 'getBusinessLocation', description: 'Get Golden Cuts address/phone/email/map location.', input_schema: { type: 'object', properties: {} } },
  { name: 'getUserAppointments', description: "Get the authenticated user's own appointments. Only works if a user is logged in.", input_schema: { type: 'object', properties: {} } },
  { name: 'createAppointment', description: 'Create a booking after the customer has explicitly confirmed the summary (service, barber, date, time, price). Requires login.', input_schema: { type: 'object', properties: { serviceId: { type: 'string' }, barberId: { type: 'string' }, date: { type: 'string' }, time: { type: 'string' } }, required: ['serviceId', 'barberId', 'date', 'time'] } },
  { name: 'cancelAppointment', description: 'Cancel one of the authenticated user\'s own appointments after explicit confirmation. Requires login.', input_schema: { type: 'object', properties: { appointmentId: { type: 'string' } }, required: ['appointmentId'] } },
  { name: 'rescheduleAppointment', description: 'Reschedule one of the authenticated user\'s own appointments after explicit confirmation and an availability check. Requires login.', input_schema: { type: 'object', properties: { appointmentId: { type: 'string' }, date: { type: 'string' }, time: { type: 'string' } }, required: ['appointmentId', 'date', 'time'] } },
];

async function runTool(name, input, userId) {
  switch (name) {
    case 'getServices': return tools.getServices();
    case 'getBarbers': return tools.getBarbers();
    case 'getBarberByName': return tools.getBarberByName(input.name);
    case 'getBarberSchedule': return tools.getBarberSchedule(input.barberId);
    case 'getAvailableDates': return tools.getAvailableDates(input.barberId, input.durationMinutes, input.daysAhead || 14);
    case 'getAvailableTimeSlots': return tools.getAvailableTimeSlots(input.barberId, input.date, input.durationMinutes);
    case 'checkAvailability': return { available: await tools.checkAvailability(input.barberId, input.date, input.time, input.durationMinutes) };
    case 'getBusinessHours': return tools.getBusinessHours();
    case 'getBusinessLocation': return tools.getBusinessLocation();
    case 'getUserAppointments':
      if (!userId) return { error: 'User is not logged in.' };
      return tools.getUserAppointments(userId);
    case 'createAppointment':
      if (!userId) return { error: 'User must be logged in to book.' };
      return tools.createAppointmentTool(userId, input);
    case 'cancelAppointment':
      if (!userId) return { error: 'User must be logged in.' };
      return tools.cancelAppointmentTool(userId, input.appointmentId);
    case 'rescheduleAppointment':
      if (!userId) return { error: 'User must be logged in.' };
      return tools.rescheduleAppointmentTool(userId, input.appointmentId, input.date, input.time);
    default:
      return { error: 'Unknown tool' };
  }
}

// ---------- Mode A: real LLM with tool use (used when ANTHROPIC_API_KEY is set) ----------
async function handleWithLLM(messages, userId) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages,
  };

  for (let turn = 0; turn < 6; turn++) {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error?.message || 'AI request failed');

    const toolUses = (data.content || []).filter(b => b.type === 'tool_use');
    if (toolUses.length === 0) {
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      return text || "I don't have enough information to answer that accurately.";
    }

    body.messages.push({ role: 'assistant', content: data.content });
    const toolResults = [];
    for (const use of toolUses) {
      const result = await runTool(use.name, use.input || {}, userId);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: use.id,
        content: JSON.stringify(result),
      });
    }
    body.messages.push({ role: 'user', content: toolResults });
  }
  return "I'm having trouble completing that request right now. Please try again in a moment.";
}

// ---------- Mode B: rule-based fallback (no API key needed), still 100% real DB data ----------
async function handleRuleBased(text, userId, context) {
  const t = text.toLowerCase();

  // Location / hours
  if (/where|location|address|find you/.test(t)) {
    const loc = await tools.getBusinessLocation();
    return `${loc.businessName} is located at ${loc.address}. You can reach us at ${loc.phone}.`;
  }
  if (/hour|open|close|closing|what time/.test(t)) {
    const hours = await tools.getBusinessHours();
    return `Golden Cuts is open ${hours.openingHours}.`;
  }

  // My appointments
  if (/my (next )?appointment|my booking|who is my barber|when is my appointment/.test(t)) {
    if (!userId) return "Please log in so I can look up your appointments.";
    const appts = await tools.getUserAppointments(userId);
    const upcoming = appts.filter(a => ['pending', 'confirmed'].includes(a.status));
    if (upcoming.length === 0) return "You don't have any upcoming appointments. Would you like to book one?";
    const next = upcoming[upcoming.length - 1];
    return `Your next appointment is ${next.service} with ${next.barber} on ${next.date} at ${next.time} ($${next.price}).`;
  }

  // Cancel
  if (/cancel/.test(t) && /appointment/.test(t)) {
    if (!userId) return "Please log in so I can find your appointment to cancel.";
    const appts = await tools.getUserAppointments(userId);
    const upcoming = appts.filter(a => ['pending', 'confirmed'].includes(a.status));
    if (upcoming.length === 0) return "You don't have any upcoming appointments to cancel.";
    const a = upcoming[0];
    return `Are you sure you want to cancel your ${a.service} appointment with ${a.barber} on ${a.date} at ${a.time}? Reply "yes, cancel it" to confirm, or use My Appointments to manage it directly.`;
  }

  // Price
  if (/price|cost|how much/.test(t)) {
    const services = await tools.getServices();
    const match = services.find(s => t.includes(s.name.toLowerCase()));
    if (match) return `${match.name} costs $${match.price} and takes about ${match.duration} minutes.`;
    const list = services.map(s => `${s.name} — $${s.price}`).join(', ');
    return `Here are our current prices: ${list}. Which service would you like to know more about?`;
  }

  // Duration
  if (/how long|duration|take/.test(t)) {
    const services = await tools.getServices();
    const match = services.find(s => t.includes(s.name.toLowerCase()));
    if (match) return `${match.name} takes approximately ${match.duration} minutes.`;
  }

  // Barber specialty / info
  const barbers = await tools.getBarbers();
  const barberMatch = barbers.find(b => t.includes(b.name.toLowerCase().split(' ')[0]));
  if (barberMatch && !/available|schedule|book|slot|time/.test(t)) {
    const spec = barberMatch.specialties?.join(', ') || 'general grooming';
    return `${barberMatch.name} specializes in ${spec} and has ${barberMatch.experience} years of experience. Rating: ${barberMatch.rating}/5.`;
  }
  if (/fade/.test(t) && /good at|specializ|who/.test(t)) {
    const matches = barbers.filter(b => (b.specialties || []).some(s => s.toLowerCase().includes('fade')));
    if (matches.length) return `These barbers specialize in fades: ${matches.map(b => b.name).join(', ')}. Would you like to check their availability?`;
  }

  // Schedule / availability
  if (barberMatch && /available|schedule|book|slot|time/.test(t)) {
    const services = await tools.getServices();
    const service = services.find(s => t.includes(s.name.toLowerCase())) || services[0];
    if (!service) return "We don't have any active services configured yet.";

    const date = nl.parseDate(t);
    const timePref = nl.parseTimePreference(t);
    const range = nl.parseRange(t);

    if (date) {
      const slots = await tools.getAvailableTimeSlots(barberMatch.id, date, service.duration);
      if (slots.length === 0) return `${barberMatch.name} has no availability on ${date}. I can check another day if you'd like.`;
      let filtered = slots;
      if (timePref?.type === 'after') filtered = slots.filter(s => s >= timePref.hhmm);
      if (timePref?.type === 'before') filtered = slots.filter(s => s <= timePref.hhmm);
      if (timePref?.type === 'range') filtered = slots.filter(s => s >= timePref.from && s <= timePref.to);
      if (timePref?.type === 'exact') {
        const isAvail = slots.includes(timePref.hhmm);
        return isAvail
          ? `Yes, ${barberMatch.name} is available on ${date} at ${timePref.hhmm}. Would you like me to book ${service.name} then?`
          : `${barberMatch.name} is not available at ${timePref.hhmm} on ${date}. The closest available times are: ${slots.slice(0, 3).join(', ')}.`;
      }
      if (filtered.length === 0) return `${barberMatch.name} doesn't have matching slots on ${date}. Full availability that day: ${slots.slice(0, 6).join(', ')}.`;
      return `${barberMatch.name}'s available times on ${date}: ${filtered.slice(0, 8).join(', ')}. Which would you like?`;
    }

    const daysAhead = range ? 7 : 14;
    const dates = await tools.getAvailableDates(barberMatch.id, service.duration, daysAhead);
    if (dates.length === 0) return `I couldn't find any upcoming availability for ${barberMatch.name}. Would you like to try another barber?`;
    return `I found availability for ${barberMatch.name} on: ${dates.slice(0, 6).map(d => d.date).join(', ')}. Want me to show times for one of these days?`;
  }

  // Generic service interest
  const services = await tools.getServices();
  if (/haircut|beard|shave|facial|package|trim/.test(t)) {
    const matches = services.filter(s => t.includes(s.name.toLowerCase().split(' ')[0]));
    const list = (matches.length ? matches : services).map(s => `${s.name} ($${s.price}, ${s.duration} min)`).join(', ');
    return `We offer: ${list}. Would you like to choose a barber and see availability?`;
  }

  if (/book|appointment/.test(t)) {
    return "I'd be happy to help you book. Which service would you like — and do you have a preferred barber?";
  }

  return "I don't have enough information to answer that accurately. I can help you check our services, barbers, or appointment availability.";
}

// POST /api/ai/chat
// body: { messages: [{role, content}], text?: string }  (text = simple mode for rule-based fallback)
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      const messages = req.body.messages && req.body.messages.length
        ? req.body.messages
        : [{ role: 'user', content: req.body.text || '' }];
      const reply = await handleWithLLM(messages, userId);
      return res.json({ reply, mode: 'llm' });
    }

    const text = req.body.text || (req.body.messages || []).slice(-1)[0]?.content || '';
    const reply = await handleRuleBased(String(text), userId, req.body.context || {});
    res.json({ reply, mode: 'rule-based' });
  } catch (err) {
    res.status(500).json({
      reply: "I'm unable to check live appointment availability right now. Please try again in a moment.",
      error: undefined,
    });
  }
});

module.exports = router;
