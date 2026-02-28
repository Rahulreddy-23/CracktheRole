import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms & Conditions | CrackTheRole',
    description: 'Terms and Conditions for CrackTheRole',
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-text-primary">Terms & Conditions</h1>
            <div className="prose prose-invert max-w-none text-text-secondary space-y-6">
                <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">1. Introduction</h2>
                <p>Welcome to CrackTheRole. By using our website (cracktherole.com) and services, you agree to these Terms and Conditions. Please read them carefully.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">2. Business Details</h2>
                <p>CrackTheRole is a brand owned and operated under the legal name <strong>Basi Reddy Rahul Reddy</strong>. Our operational address is: Buggaiah Compound, Court Area, Door no - 15/673-5, Gandhi Katta, Tadipatri, Andhra Pradesh, 515411.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">3. Use of Service</h2>
                <p>You agree to use our services only for lawful purposes. You must not use our platform to distribute malicious content, spam, or violate the rights of others. We reserve the right to terminate accounts that violate these terms.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">4. Payments and Subscriptions</h2>
                <p>We offer both free and paid services. Payments are processed securely via Razorpay. By purchasing a subscription or one-time service, you agree to the pricing and billing frequency specified at checkout.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">5. Intellectual Property</h2>
                <p>All content, features, and functionality on this platform, including text, graphics, logos, and software, are the exclusive property of CrackTheRole or its licensors and are protected by legal copyright and trademark laws.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">6. Limitation of Liability</h2>
                <p>CrackTheRole and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or any unauthorized access to your data.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">7. Changes to Terms</h2>
                <p>We may update these terms from time to time. We will notify users of any significant changes by posting the new terms on this page.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">8. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at +91 9121144351 or via the contact page.</p>
            </div>
        </div>
    );
}
