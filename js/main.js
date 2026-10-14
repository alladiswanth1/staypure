const WHATSAPP = "919515643476";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector(".header");
if (header) {
  const markHeader = () => header.classList.toggle("is-stuck", window.scrollY > 6);
  markHeader();
  window.addEventListener("scroll", markHeader, { passive: true });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

const form = document.querySelector("#visit-form");
const serviceSelect = document.querySelector("#service");
const noteField = document.querySelector("#note");
const errorList = document.querySelector("#form-error");
const okNote = document.querySelector("#form-ok");
const chips = document.querySelectorAll(".chip, .book");

let lastAutoNote = "";

function mobileDigits(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function applyRequest(service, note) {
  if (serviceSelect && service) serviceSelect.value = service;
  if (noteField && note && (noteField.value.trim() === "" || noteField.value === lastAutoNote)) {
    noteField.value = note;
    lastAutoNote = note;
  }
  chips.forEach((chip) => {
    const on = chip.classList.contains("chip") && chip.dataset.service === service && chip.dataset.note === note;
    chip.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const contact = document.querySelector("#contact");
  if (contact) {
    contact.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
}

chips.forEach((chip) => {
  chip.addEventListener("click", (event) => {
    event.preventDefault();
    applyRequest(chip.dataset.service || "", chip.dataset.note || "");
  });
});

if (form && serviceSelect && errorList && okNote) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.name.value.trim();
    const phone = mobileDigits(form.phone.value);
    const area = form.area.value.trim();
    const service = serviceSelect.value;
    const note = noteField ? noteField.value.trim() : "";
    const errors = [];

    if (name.length < 2) errors.push("Please add your name.");
    if (!/^[6-9]\d{9}$/.test(phone)) errors.push("Please add a 10-digit mobile number.");
    if (area.length < 2) errors.push("Please add your area or a nearby landmark.");
    if (!service) errors.push("Please choose what you need.");

    errorList.replaceChildren();
    if (errors.length) {
      errors.forEach((message) => {
        const item = document.createElement("li");
        item.textContent = message;
        errorList.appendChild(item);
      });
      errorList.hidden = false;
      okNote.hidden = true;
      errorList.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      errorList.focus();
      return;
    }

    const serviceLabel = serviceSelect.selectedOptions[0]
      ? serviceSelect.selectedOptions[0].textContent.trim()
      : service;
    const lines = [
      "Hello, I need water purifier service.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Area: ${area}`,
      `Need: ${serviceLabel}`,
    ];
    if (note) lines.push(`Note: ${note}`);

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
    errorList.hidden = true;
    okNote.hidden = false;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
  });
}
