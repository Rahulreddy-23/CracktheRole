import { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Contact Us | CrackTheRole',
    description: 'Contact CrackTheRole support for any queries or help.',
};

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-text-primary">Contact Us</h1>
            <p className="text-lg text-text-secondary mb-12">
                We are here to help! Whether you have a question about our pricing, need support with your account, or want to report an issue, please reach out to us.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info container */}
                <div className="bg-surface border border-border/50 rounded-2xl p-8 space-y-8">
                    <h2 className="text-2xl font-semibold text-text-primary mb-6">Our Information</h2>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium text-text-primary mb-1">Operational Address</h3>
                            <p className="text-text-secondary leading-relaxed text-sm">
                                <strong>Basi Reddy Rahul Reddy (CrackTheRole)</strong><br />
                                Buggaiah Compound, Court Area<br />
                                Door no - 15/673-5, Gandhi Katta<br />
                                Tadipatri, Andhra Pradesh, 515411<br />
                                India
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <Phone className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium text-text-primary mb-1">Phone Number</h3>
                            <p className="text-text-secondary text-sm">
                                <a href="tel:+919121144351" className="hover:text-brand-primary transition-colors">+91 9121144351</a>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium text-text-primary mb-1">Email Address</h3>
                            <p className="text-text-secondary text-sm">
                                <a href="mailto:support@cracktherole.com" className="hover:text-brand-primary transition-colors">support@cracktherole.com</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form placeholder (optional but good) */}
                <div className="bg-surface border border-border/50 rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold text-text-primary mb-6">Send us a message</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="name">Name</label>
                            <input type="text" id="name" className="w-full bg-background border border-border/50 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" placeholder="Your name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="email">Email</label>
                            <input type="email" id="email" className="w-full bg-background border border-border/50 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="message">Message</label>
                            <textarea id="message" rows={5} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary resize-none" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
