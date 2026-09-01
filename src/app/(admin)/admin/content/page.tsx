"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { adminContentApi, type FaqItem, type AboutUsContent, type ContactInfoContent, type Announcement } from "@/lib/api/adminContent";
export default function ContentManagementPage() {
  // FAQs
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqError, setFaqError] = useState<string | null>(null);

  const [editingFaq, setEditingFaq] = useState<FaqItem | "new" | null>(null);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [savingFaq, setSavingFaq] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // About Us
  const [aboutUs, setAboutUs] = useState<AboutUsContent | null>(null);
  const [loadingAboutUs, setLoadingAboutUs] = useState(true);
  const [aboutUsError, setAboutUsError] = useState<string | null>(null);
  const [aboutUsDraft, setAboutUsDraft] = useState({ content: "", mission: "" });
  const [savingAboutUs, setSavingAboutUs] = useState(false);
  const [aboutUsSaved, setAboutUsSaved] = useState(false);
  const [contactInfoDraft, setContactInfoDraft] = useState({
  email: "",
  phone: "",
  address: "",
  supportHours: "",
});
const [contactInfo, setContactInfo] = useState<ContactInfoContent | null>(null);
const [loadingContactInfo, setLoadingContactInfo] = useState(true);
const [contactInfoError, setContactInfoError] = useState<string | null>(null);
const [savingContactInfo, setSavingContactInfo] = useState(false);
const [contactInfoSaved, setContactInfoSaved] = useState(false);
const [announcements, setAnnouncements] = useState<Announcement[]>([]);
const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
const [newTitle, setNewTitle] = useState("");
const [newMessage, setNewMessage] = useState("");
const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
const [createError, setCreateError] = useState<string | null>(null);

  function loadFaqs() {
    setLoadingFaqs(true);
    setFaqError(null);
    adminContentApi.getFaqs().then((result) => {
      if (result.ok) {
        setFaqs(result.faqs);
      } else {
        setFaqError(result.message ?? "Failed to load FAQs.");
      }
      setLoadingFaqs(false);
    });
  }

function loadAboutUs() {
  setLoadingAboutUs(true);
  setAboutUsError(null);
  adminContentApi.getAboutUs().then((result) => {
    if (result.ok) {
      setAboutUs(result.aboutUs);
      setAboutUsDraft({
        content: result.aboutUs?.content ?? "",
        mission: result.aboutUs?.mission ?? "",
      });
    } else {
      setAboutUsError(result.message ?? "Failed to load About Us content.");
    }
    setLoadingAboutUs(false);
  });
}

function loadContactInfo() {
  setLoadingContactInfo(true);
  setContactInfoError(null);
  adminContentApi.getContactInfo().then((result) => {
    if (result.ok) {
      setContactInfo(result.contactInfo);
      setContactInfoDraft({
        email: result.contactInfo?.email ?? "",
        phone: result.contactInfo?.phone ?? "",
        address: result.contactInfo?.address ?? "",
        supportHours: result.contactInfo?.supportHours ?? "",
      });
    } else {
      setContactInfoError(result.message ?? "Failed to load contact info.");
    }
    setLoadingContactInfo(false);
  });
}
async function handleSaveContactInfo() {
  setSavingContactInfo(true);
  setContactInfoSaved(false);
  const result = await adminContentApi.updateContactInfo(contactInfoDraft);
  setSavingContactInfo(false);

  if (result.ok) {
    setContactInfo(result.contactInfo);
    setContactInfoSaved(true);
    setTimeout(() => setContactInfoSaved(false), 2000);
  }
}
useEffect(() => {
  loadFaqs();
  loadAboutUs();
  loadContactInfo();
  loadAnnouncements();
}, []);

  function openNewFaq() {
    setDraftQuestion("");
    setDraftAnswer("");
    setFormError(null);
    setEditingFaq("new");
  }

  function openEditFaq(faq: FaqItem) {
    setDraftQuestion(faq.question);
    setDraftAnswer(faq.answer);
    setFormError(null);
    setEditingFaq(faq);
  }

  async function handleSaveFaq() {
    if (!draftQuestion.trim() || !draftAnswer.trim()) {
      setFormError("Both question and answer are required.");
      return;
    }

    setSavingFaq(true);
    setFormError(null);

    const result =
      editingFaq === "new"
        ? await adminContentApi.createFaq(draftQuestion.trim(), draftAnswer.trim())
        : await adminContentApi.updateFaq(editingFaq!.id, draftQuestion.trim(), draftAnswer.trim());

    setSavingFaq(false);

    if (!result.ok) {
      setFormError(result.message ?? "Failed to save FAQ.");
      return;
    }

    setEditingFaq(null);
    loadFaqs();
  }

  async function handleDeleteFaq(id: string) {
    const result = await adminContentApi.deleteFaq(id);
    if (result.ok) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    }
  }

  async function handleSaveAboutUs() {
    setSavingAboutUs(true);
    setAboutUsSaved(false);
    const result = await adminContentApi.updateAboutUs(aboutUsDraft);
    setSavingAboutUs(false);

    if (result.ok) {
      setAboutUs(result.aboutUs);
      setAboutUsSaved(true);
      setTimeout(() => setAboutUsSaved(false), 2000);
    }
  }

  function loadAnnouncements() {
  setLoadingAnnouncements(true);
  setAnnouncementsError(null);
  adminContentApi.getAnnouncements().then((result) => {
    if (result.ok) {
      setAnnouncements(result.announcements);
    } else {
      setAnnouncementsError(result.message ?? "Failed to load announcements.");
    }
    setLoadingAnnouncements(false);
  });
}

async function handleCreateAnnouncement() {
  if (!newTitle.trim() || !newMessage.trim()) {
    setCreateError("Both title and message are required.");
    return;
  }

  setCreatingAnnouncement(true);
  setCreateError(null);

  const result = await adminContentApi.createAnnouncement(newTitle.trim(), newMessage.trim());

  setCreatingAnnouncement(false);

  if (!result.ok) {
    setCreateError(result.message ?? "Failed to create announcement.");
    return;
  }

  setNewTitle("");
  setNewMessage("");
  loadAnnouncements();
}

async function handleToggleStatus(announcement: Announcement) {
  const result = await adminContentApi.setAnnouncementStatus(announcement.id, !announcement.isPublished);
  if (result.ok) {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === announcement.id ? { ...a, isPublished: !a.isPublished } : a))
    );
  }
}

async function handleDeleteAnnouncement(id: string) {
  const result = await adminContentApi.deleteAnnouncement(id);
  if (result.ok) {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }
}
  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Content Management</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Edit public-facing FAQ, About Us, and Contact information.
        </p>
      </div>

      {/* FAQs */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 sm:text-base">FAQs</h2>
          <button
            type="button"
            onClick={openNewFaq}
            className="flex items-center gap-1.5 rounded-lg bg-[#EDE7F8] px-4 py-1.5 text-xs font-semibold text-[#8A38F5] transition-colors hover:bg-[#DCCFF5]"
          >
            <Plus size={14} />
            Add FAQ
          </button>
        </div>

        {loadingFaqs ? (
          <p className="py-6 text-center text-sm text-gray-400">Loading FAQs...</p>
        ) : faqError ? (
          <p className="py-6 text-center text-sm text-red-500">{faqError}</p>
        ) : faqs.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No FAQs added yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {faqs.map((faq) => (
              <div key={faq.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{faq.answer}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditFaq(faq)}
                    className="text-xs font-semibold text-[#8A38F5] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(faq.id)}
                    aria-label="Delete FAQ"
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* About Us */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">About Us</h2>

        {loadingAboutUs ? (
          <p className="py-6 text-center text-sm text-gray-400">Loading...</p>
        ) : aboutUsError ? (
          <p className="py-6 text-center text-sm text-red-500">{aboutUsError}</p>
        ) : (
          <>
            <label className="mb-1.5 block text-xs font-semibold text-gray-900">Content</label>
            <textarea
              value={aboutUsDraft.content}
              onChange={(e) => setAboutUsDraft({ ...aboutUsDraft, content: e.target.value })}
              rows={6}
              className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
            />

            <label className="mt-4 mb-1.5 block text-xs font-semibold text-gray-900">Mission</label>
            <textarea
              value={aboutUsDraft.mission}
              onChange={(e) => setAboutUsDraft({ ...aboutUsDraft, mission: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              {aboutUsSaved && <span className="text-xs text-green-600">Saved ✓</span>}
              <button
                type="button"
                onClick={handleSaveAboutUs}
                disabled={savingAboutUs}
                className="rounded-xl bg-[#6C3CFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7226e0] disabled:opacity-50"
              >
                {savingAboutUs ? "Saving..." : "Save changes"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Contact Info — placeholder until wired */}
     {/* Contact Info */}
<div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
  <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">Contact Info</h2>

  {loadingContactInfo ? (
    <p className="py-6 text-center text-sm text-gray-400">Loading...</p>
  ) : contactInfoError ? (
    <p className="py-6 text-center text-sm text-red-500">{contactInfoError}</p>
  ) : (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-900">Email</label>
          <input
            type="email"
            value={contactInfoDraft.email}
            onChange={(e) => setContactInfoDraft({ ...contactInfoDraft, email: e.target.value })}
            className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-900">Phone</label>
          <input
            type="text"
            value={contactInfoDraft.phone}
            onChange={(e) => setContactInfoDraft({ ...contactInfoDraft, phone: e.target.value })}
            className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold text-gray-900">Address</label>
        <input
          type="text"
          value={contactInfoDraft.address}
          onChange={(e) => setContactInfoDraft({ ...contactInfoDraft, address: e.target.value })}
          className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
        />
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold text-gray-900">Support Hours (optional)</label>
        <input
          type="text"
          value={contactInfoDraft.supportHours}
          onChange={(e) => setContactInfoDraft({ ...contactInfoDraft, supportHours: e.target.value })}
          placeholder="e.g. Mon–Fri, 9am–5pm WAT"
          className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
        />
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {contactInfoSaved && <span className="text-xs text-green-600">Saved ✓</span>}
        <button
          type="button"
          onClick={handleSaveContactInfo}
          disabled={savingContactInfo}
          className="rounded-xl bg-[#6C3CFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7226e0] disabled:opacity-50"
        >
          {savingContactInfo ? "Saving..." : "Save changes"}
        </button>
      </div>
    </>
  )}
</div>

      {/* Announcements — placeholder until wired */}
     {/* Announcements */}
<div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
  <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">System Announcements</h2>

  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Title</label>
  <input
    type="text"
    value={newTitle}
    onChange={(e) => setNewTitle(e.target.value)}
    placeholder="Announcement title"
    className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
  />

  <label className="mt-4 mb-1.5 block text-xs font-semibold text-gray-900">Message</label>
  <textarea
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    rows={4}
    placeholder="Announcement message"
    className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
  />

  {createError && <p className="mt-2 text-xs text-red-500">{createError}</p>}

  <div className="mt-3 flex justify-end">
    <button
      type="button"
      onClick={handleCreateAnnouncement}
      disabled={creatingAnnouncement}
      className="rounded-xl bg-[#6C3CFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7226e0] disabled:opacity-50"
    >
      {creatingAnnouncement ? "Publishing..." : "Publish Announcement"}
    </button>
  </div>

  <div className="mt-6 border-t border-gray-100 pt-4">
    <h3 className="mb-3 text-xs font-semibold text-gray-900">Existing announcements</h3>

    {loadingAnnouncements ? (
      <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
    ) : announcementsError ? (
      <p className="py-4 text-center text-sm text-red-500">{announcementsError}</p>
    ) : announcements.length === 0 ? (
      <p className="py-4 text-center text-sm text-gray-400">No announcements yet.</p>
    ) : (
      <div className="flex flex-col divide-y divide-gray-100">
        {announcements.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{a.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{a.message}</p>
              <span
                className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                  a.isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {a.isPublished ? "Published" : "Unpublished"}
              </span>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => handleToggleStatus(a)}
                className="text-xs font-semibold text-[#8A38F5] hover:underline"
              >
                {a.isPublished ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAnnouncement(a.id)}
                aria-label="Delete announcement"
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

      {/* FAQ edit/create modal */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">
              {editingFaq === "new" ? "Add FAQ" : "Edit FAQ"}
            </h3>

            {formError && <p className="mt-2 text-xs text-red-500">{formError}</p>}

            <label className="mt-4 mb-1.5 block text-xs font-semibold text-gray-900">Question</label>
            <input
              type="text"
              value={draftQuestion}
              onChange={(e) => setDraftQuestion(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
            />

            <label className="mt-4 mb-1.5 block text-xs font-semibold text-gray-900">Answer</label>
            <textarea
              value={draftAnswer}
              onChange={(e) => setDraftAnswer(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                disabled={savingFaq}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFaq}
                disabled={savingFaq}
                className="flex-1 rounded-xl bg-[#6C3CFF] py-2.5 text-sm font-semibold text-white hover:bg-[#7226e0] disabled:opacity-50"
              >
                {savingFaq ? "Saving..." : "Save FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}