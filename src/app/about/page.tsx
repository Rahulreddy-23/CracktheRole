import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | CrackTheRole',
    description: 'Learn more about CrackTheRole and our mission to help engineers.',
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-text-primary">About CrackTheRole</h1>

            <div className="prose prose-invert max-w-none text-text-secondary space-y-6">
                <p className="text-xl text-text-primary leading-relaxed">
                    CrackTheRole is built for India&apos;s ambitious engineers. Our mission is to democratize interview preparation and help you land your dream tech role with confidence.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
                    <div className="bg-surface border border-border/50 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-3">Our Vision</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            To create a level playing field where every software engineer, regardless of their background or current company, has access to world-class interview preparation and salary intelligence.
                        </p>
                    </div>
                    <div className="bg-surface border border-border/50 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-3">What We Do</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            We provide AI-powered mock interviews that simulate the real experience of top tech companies. Coupled with comprehensive salary data and detailed feedback, we give you the tools to succeed.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-text-primary mt-12 mb-4">The Company</h2>
                <p>
                    Operated by <strong>Basi Reddy Rahul Reddy</strong> out of Andhra Pradesh, CrackTheRole was born from the frustration of finding effective, realistic mock interviews. We believe that practice shouldn&apos;t just be about solving algorithms; it should be about communicating effectively, handling pressure, and understanding what the interviewer really wants to see.
                </p>
                <p>
                    We are continuously evolving our platform, adding more company-specific data, and refining our AI models to provide the most accurate and helpful feedback possible.
                </p>
            </div>
        </div>
    );
}
