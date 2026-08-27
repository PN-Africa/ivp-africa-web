"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { employerJobsApi } from "@/lib/api/employerJob";
import { subscriptionApi, plans , SubscriptionState} from "@/lib/api/subscription";
import { generateInvoicePdf } from "@/lib/utils/generateInvoicePdf";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SubscriptionPage() {
  const { session } = useSession();
  const [state, setState] = useState<SubscriptionState | null>(null);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [showPlanList, setShowPlanList] = useState(false);

async function refresh() {
  if (!session?.email) return;

  try {
    const subRes = await subscriptionApi.get(session.email);
    setState(subRes);

    const jobsRes = await employerJobsApi.getAll();
    const jobsArray = jobsRes.ok && jobsRes.data ? jobsRes.data : [];
    setActiveJobCount(jobsArray.filter((j) => j.status === "active").length);
  } catch (error) {
    console.error("Failed to refresh subscription data:", error);
  }
}
  useEffect(() => {
    refresh();
  }, [session?.email]);

  async function handleSelectPlan(planId: string) {
    if (!session?.email || planId === state?.planId) {
      setShowPlanList(false);
      return;
    }
    
    // 1. Await the plan change so it finishes saving first
    await subscriptionApi.changePlan(session.email, planId);
    
    // 2. Await the refresh so the UI updates with the new data
    await refresh(); 
    
    setShowPlanList(false);
  }

  if (!state) return null;

  const currentPlan = plans.find((p) => p.id === state.planId) ?? plans[1];
  const jobLimitLabel = currentPlan.jobLimit === null ? "Unlimited" : `${currentPlan.jobLimit}`;
  const jobUsagePercent =
    currentPlan.jobLimit === null ? 0 : Math.min(100, (activeJobCount / currentPlan.jobLimit) * 100);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Subscription & Billing</h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Manage your enterprise plan, usage limits, and transaction invoices.
          </p>
        </div>
        <div className="relative self-start">
          <button
            type="button"
            onClick={() => setShowPlanList((v) => !v)}
            className="rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7226e0] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Change Plan
          </button>

          {showPlanList && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPlanList(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                {plans.map((plan) => {
                  const isCurrent = plan.id === state.planId;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handleSelectPlan(plan.id)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                    >
                      <span className={isCurrent ? "font-semibold text-[#8A38F5]" : "text-gray-700"}>
                        {plan.name} — ${plan.price}/mo
                      </span>
                      {isCurrent && <Check size={14} className="text-[#8A38F5]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Current plan + payment history */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 sm:text-base">{currentPlan.name}</p>
                <p className="text-xs text-gray-400">Next renewal on {formatDate(state.nextRenewal)}</p>
              </div>
              <p className="text-lg font-bold text-[#8A38F5] sm:text-xl">
                ${currentPlan.price}
                <span className="text-sm font-medium text-gray-400">/mo</span>
              </p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
                <span>Active Jobs Posted</span>
                <span>
                  {activeJobCount} / {jobLimitLabel} Jobs
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-[#8A38F5]"
                  style={{ width: `${jobUsagePercent || (currentPlan.jobLimit === null ? 15 : 0)}%` }}
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
                <span>Candidates Viewed</span>
                <span>
                  {state.candidatesViewed} /{" "}
                  {currentPlan.applicationLimit === null ? "Unlimited" : currentPlan.applicationLimit}
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: "60%" }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <h2 className="text-sm font-bold text-gray-900 sm:text-base">Payment History</h2>
            <div className="mt-3 flex flex-col divide-y divide-gray-100">
              {state.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{payment.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(payment.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">${payment.amount.toFixed(2)}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        payment.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {payment.status === "success" ? "Success" : "Failed"}
                    </span>
                  <button
                    type="button"
                    onClick={() => generateInvoicePdf(payment, session?.displayName ?? "Company")}
                    className="text-xs font-medium text-[#8A38F5] hover:underline"
                    >
                    Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Plan Options — kept visible on the dashboard, per the Figma */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
          <h2 className="text-sm font-bold text-gray-900 sm:text-base">Upgrade Plan Options</h2>
          <div className="mt-3 flex flex-col gap-3">
            {plans.map((plan) => {
              const isActive = plan.id === state.planId;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-4 ${
                    isActive ? "border-[#8A38F5] bg-[#F5F3FA]" : "border-gray-100"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-3 right-3 rounded-full bg-[#8A38F5] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Active
                    </span>
                  )}
                  <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    ${plan.price}
                    <span className="text-xs font-medium text-gray-400">/mo</span>
                  </p>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Check size={12} className="shrink-0 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}