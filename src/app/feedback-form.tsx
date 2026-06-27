"use client";

import { FormEvent, useState } from "react";

type FeedbackFormCopy = {
  website: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  messagePlaceholder: string;
  consent: string;
  submit: string;
  submitting: string;
  success: string;
  fallbackError: string;
};

type FeedbackStatus =
  | { type: "idle"; message: "" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const initialStatus: FeedbackStatus = { type: "idle", message: "" };

function getHubSpotTrackingCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.cookie
      .split("; ")
      .find((item) => item.startsWith("hubspotutk="))
      ?.split("=")[1] || null
  );
}

export default function FeedbackForm({ copy }: { copy: FeedbackFormCopy }) {
  const [status, setStatus] = useState<FeedbackStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setStatus(initialStatus);

    try {
      const response = await fetch("/api/hubspot/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: formData.get("firstname"),
          lastname: formData.get("lastname"),
          email: formData.get("email"),
          company: formData.get("company"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          consent: formData.get("consent") === "on",
          website: formData.get("website"),
          hutk: getHubSpotTrackingCookie(),
          pageUri: window.location.href,
          pageName: document.title,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        console.error(data.error || copy.fallbackError);
        throw new Error(copy.fallbackError);
      }

      form.reset();
      setStatus({
        type: "success",
        message: copy.success,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : copy.fallbackError,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submitFeedback}>
      <div className="hidden">
        <label>
          {copy.website}
          <input autoComplete="off" name="website" tabIndex={-1} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-[#211E18]">
            {copy.firstName}
          </span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-[#211E18]/16 bg-white px-3 text-sm text-[#211E18] outline-none transition focus:border-[#DC6B43] focus:ring-2 focus:ring-[#DC6B43]/20"
            name="firstname"
            required
            autoComplete="given-name"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#211E18]">
            {copy.lastName}
          </span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-[#211E18]/16 bg-white px-3 text-sm text-[#211E18] outline-none transition focus:border-[#DC6B43] focus:ring-2 focus:ring-[#DC6B43]/20"
            name="lastname"
            autoComplete="family-name"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-[#211E18]">
            {copy.email}
          </span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-[#211E18]/16 bg-white px-3 text-sm text-[#211E18] outline-none transition focus:border-[#DC6B43] focus:ring-2 focus:ring-[#DC6B43]/20"
            name="email"
            required
            type="email"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#211E18]">
            {copy.phone}
          </span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-[#211E18]/16 bg-white px-3 text-sm text-[#211E18] outline-none transition focus:border-[#DC6B43] focus:ring-2 focus:ring-[#DC6B43]/20"
            name="phone"
            type="tel"
            autoComplete="tel"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-[#211E18]">
          {copy.company}
        </span>
        <input
          className="mt-1 h-11 w-full rounded-md border border-[#211E18]/16 bg-white px-3 text-sm text-[#211E18] outline-none transition focus:border-[#DC6B43] focus:ring-2 focus:ring-[#DC6B43]/20"
          name="company"
          autoComplete="organization"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-[#211E18]">
          {copy.message}
        </span>
        <textarea
          className="mt-1 min-h-32 w-full resize-y rounded-md border border-[#211E18]/16 bg-white px-3 py-3 text-sm text-[#211E18] outline-none transition focus:border-[#DC6B43] focus:ring-2 focus:ring-[#DC6B43]/20"
          name="message"
          required
          placeholder={copy.messagePlaceholder}
        />
      </label>

      <label className="flex gap-3 text-sm leading-6 text-[#5C5648]">
        <input
          className="mt-1 h-4 w-4 rounded border-[#211E18]/20 text-[#2E4A3A]"
          name="consent"
          required
          type="checkbox"
        />
        <span>
          {copy.consent}
        </span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-[#DC6B43] px-5 text-sm font-bold text-[#211E18] transition hover:bg-[#C2552F] disabled:cursor-wait disabled:bg-[#5C5648]/40"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? copy.submitting : copy.submit}
        </button>
        {status.message ? (
          <p
            aria-live="polite"
            className={`text-sm ${
              status.type === "success" ? "text-[#2E4A3A]" : "text-[#C2552F]"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
