"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { employerJobsApi } from "@/lib/api/employerJob";
import { subscriptionApi, RealPlan, RealSubscription, RealPaymentRecord } from "@/lib/api/subscription";
import { generateInvoicePdf } from "@/lib/utils/generateInvoicePdf";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getLimitsForPlan(planName: string) {
  const name = planName.toLowerCase();
  if (name.includes("starter") || name.includes("free")) return { jobLimit: 3, appLimit: 50 };
  if (name.includes("professional") || name.includes("pro")) return { jobLimit: 15, appLimit: null };
  return { jobLimit: null, appLimit: null }; // Enterprise / Unlimited
}

export default function SubscriptionPage() {
  const { session } = useSession();
  const [plans, setPlans] = useState<RealPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<RealSubscription | null>(null);
  const [payments, setPayments] = useState<RealPaymentRecord[]>([]);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [showPlanList, setShowPlanList] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!session?.email) return;

    try {
      // 1. Fetch available plans
      const plansRes = await subscriptionApi.getPlans();
      const fetchedPlans = Array.isArray(plansRes.data) ? plansRes.data : Array.isArray(plansRes) ? plansRes : [];
      setPlans(fetchedPlans);

      // 2. Fetch current subscription
      const subRes = await subscriptionApi.getCurrent();
      setCurrentSub(subRes.data ? subRes.data : subRes);

      // 3. Fetch active jobs to calculate quota usage
      const jobsRes = await employerJobsApi.getAll(session.email);
      const jobsArray = Array.isArray(jobsRes.data) ? jobsRes.data : Array.isArray(jobsRes) ? jobsRes : [];
      setActiveJobCount(jobsArray.filter((j: any) => j.status === "active").length);

      // 4. Fetch actual Payment History
      const historyRes = await subscriptionApi.getPaymentHistory();
      const historyArray = Array.isArray(historyRes.data) ? historyRes.data : Array.isArray(historyRes) ? historyRes : [];
      setPayments(historyArray);

    } catch (error) {
      console.error("Failed to refresh subscription data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [session?.email]);

  async function handleSelectPlan(planId: string) {
    if (!session?.email || planId === currentSub?.planId) {
      setShowPlanList(false);
      return;
    }
    
    try {
      // Fire payment initialization
      const res = await subscriptionApi.initializePayment(planId);
      
      // Handle nested .data depending on how apiFetch parses JSON
      const paymentUrl = (res as any).data?.paymentUrl || (res as any).paymentUrl;
      
      if (paymentUrl) {
        // Redirect browser to Paystack checkout
        window.location.href = paymentUrl;
      } else {
        alert("Could not initialize checkout. Please try again.");
      }
    } catch (err) {
      console.error("Failed to initialize checkout", err);
      alert("Failed to process payment request. Please try again.");
    } finally {
      setShowPlanList(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500 animate-pulse">Loading subscription details...</div>;
  }

  const activePlan = currentSub?.plan ?? plans[0]; 
  if (!activePlan) return null;

  const limits = getLimitsForPlan(activePlan.name);
  const jobLimitLabel = limits.jobLimit === null ? "Unlimited" : `${limits.jobLimit}`;
  const jobUsagePercent = limits.jobLimit === null ? 0 : Math.min(100, (activeJobCount / limits.jobLimit) * 100);

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
                  const isCurrent = plan.id === currentSub?.planId;
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mt-6">
        {/* Current plan + payment history */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 sm:text-base">{activePlan.name}</p>
                  {currentSub?.status === "EXPIRED" && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 font-semibold">Expired</span>
                  )}
                </div>
                {currentSub?.endDate && currentSub?.status === "ACTIVE" ? (
                  <p className="text-xs text-gray-400">Next renewal on {formatDate(currentSub.endDate)}</p>
                ) : (
                   <p className="text-xs text-gray-400">No active renewal schedule</p>
                )}
              </div>
              <p className="text-lg font-bold text-[#8A38F5] sm:text-xl">
                ${activePlan.price}
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
                  style={{ width: `${jobUsagePercent || (limits.jobLimit === null ? 15 : 0)}%` }}
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
                <span>Application Limit</span>
                <span>
                  {limits.appLimit === null ? "Unlimited Applications" : `${limits.appLimit} per month`}
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: limits.appLimit === null ? "15%" : "0%" }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <h2 className="text-sm font-bold text-gray-900 sm:text-base">Payment History</h2>
            {payments.length === 0 ? (
              <p className="text-xs text-gray-500 mt-4">No payment history available.</p>
            ) : (
              <div className="mt-3 flex flex-col divide-y divide-gray-100">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{payment.plan.name} - Subscription</p>
                      <p className="text-xs text-gray-400">{formatDate(payment.createdAt)} • Ref: {payment.reference}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        ${Number(payment.amount).toFixed(2)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          payment.status === "SUCCESS" 
                            ? "bg-green-50 text-green-700" 
                            : payment.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {payment.status}
                      </span>
                      {payment.status === "SUCCESS" && (
                        <button
                          type="button"
                          onClick={() => generateInvoicePdf({
                            id: payment.reference, 
                            description: `${payment.plan.name} - Subscription`, 
                            amount: Number(payment.amount), 
                            date: payment.createdAt
                          } as any, session?.displayName ?? "Company")}
                          className="text-xs font-medium text-[#8A38F5] hover:underline"
                        >
                          Download PDF
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Plan Options */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
          <h2 className="text-sm font-bold text-gray-900 sm:text-base">Upgrade Plan Options</h2>
          <div className="mt-3 flex flex-col gap-3">
            {plans.map((plan) => {
              const isActive = plan.id === currentSub?.planId;
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
                    {plan.benefits?.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Check size={12} className="shrink-0 text-green-600" />
                        {benefit}
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