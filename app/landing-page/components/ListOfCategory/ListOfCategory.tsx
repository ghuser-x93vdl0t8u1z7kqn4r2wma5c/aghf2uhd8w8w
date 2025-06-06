"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type Skill = {
  skill: string;
  count: number;  // keep for sorting but won't display
};

const MAX_SKILLS = 20;

export default function ListOfCategory() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('main_skill, skills')
          .eq('account_type', 'freelancer')
          .not('main_skill', 'is', null);

        if (error) throw error;

        // Process the data to count all skills
        const skillMap = new Map<string, number>();
        
        data.forEach(({ main_skill, skills }) => {
          // Add main skill
          if (main_skill) {
            skillMap.set(main_skill, (skillMap.get(main_skill) || 0) + 1);
          }
          
          // Add additional skills
          if (skills && Array.isArray(skills)) {
            skills.forEach(skill => {
              if (skill) {
                skillMap.set(skill, (skillMap.get(skill) || 0) + 1);
              }
            });
          }
        });

        // Convert map to array, sort by count, and take top 20
        const skillArray = Array.from(skillMap.entries())
          .map(([skill, count]) => ({
            skill,
            count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, MAX_SKILLS);

        setSkills(skillArray);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-pulse">Loading skills...</div>
          </div>
        </div>
      </section>
    );
  }

  // Split skills into two columns (10 skills each)
  const midPoint = Math.ceil(skills.length / 2);
  const firstColumnSkills = skills.slice(0, midPoint);
  const secondColumnSkills = skills.slice(midPoint);

  return (
    <section className="w-full bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left side with illustration and title */}
          <div className="w-full lg:w-[280px] lg:shrink-0">
            <div className="lg:sticky lg:top-8">
              <h2 className="yatra-one-text text-[2.5rem] text-heading">
                Top skills
              </h2>
              <img 
                src="/skills-illustration.svg" 
                alt="Skills Illustration" 
                className="w-auto mb-8"
              />
            </div>
          </div>

          {/* Two Column Skills Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
              <div className="space-y-4">
                {firstColumnSkills.map((skill) => (
                  <Link 
                    key={skill.skill}
                    href={`/categories/${encodeURIComponent(skill.skill)}`}
                    className="block text-body hover:text-green-hover transition-colors"
                  >
                    {skill.skill}
                  </Link>
                ))}
              </div>
              <div className="space-y-4">
                {secondColumnSkills.map((skill) => (
                  <Link 
                    key={skill.skill}
                    href={`/categories/${encodeURIComponent(skill.skill)}`}
                    className="block text-body hover:text-green-hover transition-colors"
                  >
                    {skill.skill}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 