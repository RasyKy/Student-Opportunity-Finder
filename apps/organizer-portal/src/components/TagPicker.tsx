"use client";

const TAG_GROUPS = [
  {
    title: "Opportunity Type",
    tags: ["Internship", "Volunteering", "Course", "Event", "Competition & Hackathon", "Fellowship", "Exchange Program"],
  },
  {
    title: "Technology",
    tags: ["Software Development", "Web Development", "Data & Mathematics", "Cybersecurity", "Mobile Development", "AI & Machine Learning", "Cloud Computing", "UI/UX Design"],
  },
  {
    title: "Business",
    tags: ["Entrepreneurship", "Marketing", "Finance", "Management", "Accounting", "Human Resources", "E-commerce", "Tourism & Hospitality", "Logistics & Supply Chain"],
  },
  {
    title: "Social Sciences",
    tags: ["Social Work", "Community Development", "Public Policy", "Law", "Education", "Psychology", "Sociology"],
  },
  {
    title: "Arts & Media",
    tags: ["Graphic Design", "Photography", "Journalism", "Film & Media", "Music & Performance"],
  },
  {
    title: "Science & Health",
    tags: ["Medicine", "Public Health", "Biology", "Agriculture", "Environment & Sustainability", "Chemistry", "Nursing"],
  },
  {
    title: "Engineering",
    tags: ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Architecture", "Industrial Engineering"],
  },
  {
    title: "Skills",
    tags: ["Marketing & Social Media", "Writing & Translation", "Public Speaking", "Photography & Videography", "Event Planning", "Project Management", "Community Organizing"],
  },
  {
    title: "Target Audience",
    tags: ["Open to All", "High School Student", "Undergraduate", "Postgraduate", "Recent Graduate", "Women in STEM", "Youth (Under 18)"],
  },
  {
    title: "Format",
    tags: ["Online", "In-person", "Hybrid", "Self-Paced"],
  },
];

interface TagPickerProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function TagPicker({ selected, onChange }: TagPickerProps) {
  function toggle(tag: string) {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : [...selected, tag]
    );
  }

  return (
    <div className="space-y-6">
      {TAG_GROUPS.map(group => (
        <div key={group.title}>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            {group.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.tags.map(tag => {
              const active = selected.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${
                    active
                      ? 'bg-[#3B329C] text-white border-[#3B329C] shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
