"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { 
  subscriptionApi, 
  RealPlan, 
  RealSubscription, 
  RealPaymentRecord,
  SubscriptionUsageResponse
} from "@/lib/api/subscription";
import { generateInvoicePdf } from "@/lib/utils/generateInvoicePdf";

function formatDate(iso: string) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SubscriptionPage() {
  const { session } = useSession();
  
  const [plans, setPlans] = useState<RealPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<RealSubscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<RealPaymentRecord[]>([]);
  const [usageData, setUsageData] = useState<SubscriptionUsageResponse | null>(null);
  
  const [showPlanList, setShowPlanList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    if (!session?.email) return;

    try {
      const [plansRes, subRes, historyRes, usageRes] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getCurrent(),
        subscriptionApi.getPaymentHistory(),
        subscriptionApi.getUsage(),
      ]);

      // Unwrap .data on success
      if (plansRes.ok) {
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      }

      if (subRes.ok) {
        setCurrentSub(subRes.data);
      }

      if (historyRes.ok) {
        setPaymentHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      }

      if (usageRes.ok) {
        setUsageData(usageRes.data);
      }

    } catch (error) {
      console.error("Failed to refresh subscription data:", error);
    } finally {
      setIsLoading(false);
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
      const res = await subscriptionApi.initializePayment(planId);
      
      // Check .ok and extract paymentUrl from .data
      if (res.ok && res.data?.paymentUrl) {
        window.location.assign(res.data.paymentUrl);
      } else if (!res.ok) {
        console.error("Payment initialization failed:", res.message);
      }
    } catch (error) {
      console.error("Failed to initialize payment:", error);
    } finally {
      setShowPlanList(false);
    }
  }

  if (isLoading) return <div className="p-6 text-gray-500">Loading subscription details...</div>;

  const currentPlanDetails = currentSub 
    ? (plans.find((p) => p.id === currentSub.planId) ?? currentSub.plan)
    : null;

  const jobLimitInfo = usageData?.limits?.jobs;
  const jobPercentage = jobLimitInfo 
    ? (jobLimitInfo.isUnlimited 
        ? 100 
        : Math.min((jobLimitInfo.used / jobLimitInfo.total) * 100, 100))
    : 0;

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
        <div className="flex flex-col gap-4 lg:col-span-2">
          
          {/* Current plan card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            {currentSub ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 sm:text-base">{currentPlanDetails?.name || "Current Plan"}</p>
                    <p className="text-xs text-gray-400">Next renewal on {formatDate(currentSub.endDate)}</p>
                    <p className="text-xs font-medium mt-1">
                      Status: <span className={currentSub.status === "ACTIVE" ? "text-green-600" : "text-red-600"}>{currentSub.status}</span>
                    </p>
                  </div>
                  <p className="text-lg font-bold text-[#8A38F5] sm:text-xl">
                    ${currentPlanDetails?.price || 0}
                    <span className="text-sm font-medium text-gray-400">/mo</span>
                  </p>
                </div>

                {jobLimitInfo && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
                      <span>Jobs Posted This Cycle</span>
                      <span className="font-medium">
                        {jobLimitInfo.used} / {jobLimitInfo.isUnlimited ? "Unlimited" : jobLimitInfo.total} Jobs
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${
                          jobPercentage >= 90 ? 'bg-red-500' : 'bg-[#8A38F5]'
                        } transition-all duration-500 ease-in-out`}
                        style={{ width: `${jobPercentage}%` }} 
                      />
                    </div>
                    {jobPercentage >= 90 && !jobLimitInfo.isUnlimited && (
                      <p className="mt-2 text-xs text-red-500">You are approaching your plan limit.</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">No active subscription found.</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <h2 className="text-sm font-bold text-gray-900 sm:text-base">Payment History</h2>
            <div className="mt-3 flex flex-col divide-y divide-gray-100">
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-gray-500 py-3">No payment history found.</p>
              ) : (
                paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {payment.plan?.name || "Subscription"} Plan
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(payment.createdAt)} • Ref: {payment.reference}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">${Number(payment.amount).toFixed(2)}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          payment.status === "SUCCESS" ? "bg-green-50 text-green-700" : 
                          payment.status === "PENDING" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"
                        }`}
                      >
                        {payment.status === "SUCCESS" ? "Success" : payment.status === "PENDING" ? "Pending" : "Failed"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          generateInvoicePdf(
                            {
                              id: payment.id,
                              description: `${payment.plan?.name || "Subscription"} Plan`,
                              date: payment.createdAt,
                              amount: Number(payment.amount),
                              status: payment.status.toLowerCase()
                            }, 
                            session?.displayName ?? "Company"
                          );
                        }}
                        className="text-xs font-medium text-[#8A38F5] hover:underline"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
          <h2 className="text-sm font-bold text-gray-900 sm:text-base">Available Plans</h2>
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
                    {plan.benefits?.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-1.5 text-xs text-gray-600">
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