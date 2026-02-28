import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | CrackTheRole',
    description: 'Refund & Cancellation Policy for CrackTheRole',
};

export default function RefundPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-text-primary">Refund & Cancellation Policy</h1>
            <div className="prose prose-invert max-w-none text-text-secondary space-y-6">
                <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">1. Subscription Cancellations</h2>
                <p>You may cancel your CrackTheRole subscription at any time. When you cancel, your subscription will remain active until the end of the current billing cycle. After the cycle ends, your account will revert to the free tier.</p>
                <p>To cancel your subscription, please navigate to your account settings and select &quot;Cancel Subscription&quot;, or contact our support team at +91 9121144351.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">2. Refund Policy</h2>
                <p>We offer a transparent refund policy depending on the service purchased:</p>

                <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    <li><strong>Monthly Subscriptions (Pro - 499 INR):</strong> We offer a 7-day money-back guarantee for your first monthly subscription payment. If you are not satisfied, contact us within 7 days of your initial purchase for a full refund.</li>
                    <li><strong>Annual Subscriptions (Pro Yearly - 3999 INR):</strong> Annual subscriptions are eligible for a full refund within 14 days of the original purchase.</li>
                    <li><strong>One-time Services (Resume Review, Mock Interviews):</strong> Refunds for one-time services are only provided if the service has not yet been delivered or scheduled. Once the review is completed or the interview takes place, no refunds will be issued.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">3. Refund Processing Timelines</h2>
                <p>Once a refund request is approved, we will initiate the refund to your original payment method via Razorpay.</p>
                <p><strong>Processing Time:</strong> Refunds typically take <strong>5-7 business days</strong> to reflect in your bank account, depending on your bank or credit card issuer.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">4. Exceptions</h2>
                <p>We do not provide refunds for partial months of service, or if we terminate your account due to a violation of our Terms and Conditions.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">5. Contact for Refunds</h2>
                <p>To request a refund, please contact us:</p>
                <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    <li>Phone: +91 9121144351</li>
                    <li>Address: Buggaiah Compound, Court Area, Door no - 15/673-5, Gandhi Katta, Tadipatri, Andhra Pradesh, 515411</li>
                </ul>
            </div>
        </div>
    );
}
