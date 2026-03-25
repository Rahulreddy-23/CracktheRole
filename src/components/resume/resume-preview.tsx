"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types";

interface ResumePreviewProps {
  data: Partial<ResumeData>;
  className?: string;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, className }, ref) => {
    const { personalInfo, summary, experience = [], education = [], skills = [], projects = [], certifications = [] } = data;

    const hasContent = personalInfo?.fullName || summary || experience.length > 0;

    if (!hasContent) {
      return (
        <div ref={ref} className={cn("flex items-center justify-center h-64 text-muted-foreground text-sm", className)}>
          Your resume preview will appear here.
        </div>
      );
    }

    return (
      <>
        {/* Screen styles */}
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #resume-print-area, #resume-print-area * { visibility: visible !important; }
            #resume-print-area {
              position: fixed !important;
              inset: 0 !important;
              background: white !important;
              color: black !important;
              padding: 0.75in 0.75in !important;
              font-family: 'Times New Roman', Times, serif !important;
              font-size: 10.5pt !important;
              line-height: 1.4 !important;
            }
            .resume-section-heading {
              font-size: 11pt !important;
              border-bottom: 1px solid #555 !important;
              margin-bottom: 4pt !important;
              padding-bottom: 2pt !important;
              text-transform: uppercase !important;
              letter-spacing: 0.05em !important;
            }
          }
        `}</style>

        <div
          id="resume-print-area"
          ref={ref}
          className={cn(
            "bg-zinc-900/60 rounded-xl p-8 text-sm leading-relaxed font-sans print:bg-white print:text-black print:rounded-none print:p-0",
            className
          )}
        >
          {/* Header */}
          {personalInfo?.fullName && (
            <div className="text-center mb-5 pb-4 border-b border-white/10 print:border-zinc-300">
              <h1 className="text-2xl font-bold tracking-tight print:text-black">
                {personalInfo.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground print:text-zinc-600">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <><span className="text-white/20 print:text-zinc-300">·</span><span>{personalInfo.phone}</span></>}
                {personalInfo.location && <><span className="text-white/20 print:text-zinc-300">·</span><span>{personalInfo.location}</span></>}
                {personalInfo.linkedin && <><span className="text-white/20 print:text-zinc-300">·</span><a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline print:text-blue-700 print:no-underline">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</a></>}
                {personalInfo.github && <><span className="text-white/20 print:text-zinc-300">·</span><a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline print:text-blue-700 print:no-underline">{personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</a></>}
                {personalInfo.portfolio && <><span className="text-white/20 print:text-zinc-300">·</span><a href={personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline print:text-blue-700 print:no-underline">{personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, "")}</a></>}
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <Section title="Summary">
              <p className="text-sm text-muted-foreground print:text-zinc-700 leading-relaxed">{summary}</p>
            </Section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <Section title="Experience">
              <div className="space-y-4">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold print:text-black">{exp.role}</p>
                        <p className="text-sm text-muted-foreground print:text-zinc-600">{exp.company}</p>
                      </div>
                      <p className="text-xs text-muted-foreground print:text-zinc-500 whitespace-nowrap shrink-0 mt-0.5">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </p>
                    </div>
                    {exp.bullets.length > 0 && (
                      <ul className="mt-2 space-y-1 pl-4">
                        {exp.bullets.map((b, j) => (
                          <li key={j} className="text-sm text-muted-foreground print:text-zinc-700 list-disc list-outside">
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <Section title="Education">
              <div className="space-y-3">
                {education.map((edu, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold print:text-black">{edu.degree} in {edu.field}</p>
                      <p className="text-sm text-muted-foreground print:text-zinc-600">
                        {edu.institution}
                        {edu.gpa ? ` · GPA ${edu.gpa}` : ""}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground print:text-zinc-500 whitespace-nowrap shrink-0 mt-0.5">
                      {edu.startDate} – {edu.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <Section title="Skills">
              <div className="space-y-1.5">
                {skills.map((skill, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="font-medium text-foreground/80 print:text-zinc-800 shrink-0">{skill.category}:</span>
                    <span className="text-muted-foreground print:text-zinc-700">{skill.items.join(", ")}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Section title="Projects">
              <div className="space-y-3">
                {projects.map((proj, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold print:text-black">{proj.name}</p>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline print:text-blue-700 print:no-underline">
                          {proj.link.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground print:text-zinc-700 mt-0.5">{proj.description}</p>
                    {proj.technologies.length > 0 && (
                      <p className="text-xs text-muted-foreground print:text-zinc-500 mt-1">
                        <span className="font-medium">Tech:</span> {proj.technologies.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <Section title="Certifications">
              <div className="space-y-1.5">
                {certifications.map((cert, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium print:text-black">{cert.name}</span>
                    <span className="text-muted-foreground print:text-zinc-600 text-xs">
                      {cert.issuer} · {cert.date}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
export default ResumePreview;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="resume-section-heading text-xs font-bold uppercase tracking-widest text-foreground/60 print:text-zinc-500 border-b border-white/10 print:border-zinc-300 pb-1 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
