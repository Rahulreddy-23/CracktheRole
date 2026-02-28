import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | CrackTheRole',
    description: 'Privacy Policy for CrackTheRole',
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-text-primary">Privacy Policy</h1>
            <div className="prose prose-invert max-w-none text-text-secondary space-y-6">
                <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">1. Introduction</h2>
                <p>At CrackTheRole (operated legally as Basi Reddy Rahul Reddy), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (cracktherole.com).</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">2. Information We Collect</h2>
                <p>We may collect personal information that you voluntarily provide to us when registering, such as your name, email address, phone number (+91 9121144351), and professional background. We also automatically collect certain information about your device and usage of our platform.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">3. How We Use Your Information</h2>
                <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    <li>To provide, operate, and maintain our platform</li>
                    <li>To process transactions and send related information (handled securely via Razorpay)</li>
                    <li>To improve, personalize, and expand our services</li>
                    <li>To communicate with you, including for customer service and updates</li>
                    <li>To analyze usage patterns and improve user experience</li>
                </ul>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">4. Sharing Your Information</h2>
                <p>We do not sell your personal information. We may share information with third-party vendors and service providers (like payment processors and hosting services) who perform services for us or on our behalf and require access to such information to do that work.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">5. Security of Your Information</h2>
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">6. Your Rights</h2>
                <p>Depending on your location, you may have the right to request access to the personal information we collect from you, change that information, or delete it. To request to review, update, or delete your personal information, please contact us.</p>

                <h2 className="text-2xl font-semibold text-text-primary mt-8">7. Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at our operational address: Buggaiah Compound, Court Area, Door no - 15/673-5, Gandhi Katta, Tadipatri, Andhra Pradesh, 515411, or call us at +91 9121144351.</p>
            </div>
        </div>
    );
}
