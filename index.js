import static_json_v1 from "./json/data.json" with { type: 'json' };

function hostnameFromEmailAddress(email) {
  if (email && typeof email === "string" && email.search(/@/) > 0)
    return email.split(/@/)[1];
  return null;
}

export function isFakeDomain(domain, json = false) {
  if (!domain || typeof domain !== 'string') return false;
  const normalizedDomain = domain.toLowerCase().trim();
  if (!json) json = static_json_v1;
  for (let dom of Object.keys(json.domains)) {
    // exact match
    if (dom === normalizedDomain) return dom;
    // subdomain match
    if (normalizedDomain.search(new RegExp(`.+\\.${dom.replace(/\./g, '\\.')}$`)) === 0) return dom;
  }
  return false;
}

export function isFakeEmail(email, json = false) {
  return isFakeDomain(hostnameFromEmailAddress(email), json);
}

export function isPlusAddressingEmail(email) {
  if (email && typeof email === "string" && email.search(/@/) > 0) {
    const localPart = email.split(/@/)[0];
    return localPart.includes('+');
  }
  return false;
}