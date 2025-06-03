'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type Profile = {
  username: string;
  account_type: string;
  profile_picture_url: string | null;
  main_skill: string;
  skills: string[] | null;
  rating: number | null;
};

export default function CategoryPage() {
  const { category } = useParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodedCategory = decodeURIComponent(category as string);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Fetch profiles where either main_skill matches or the skill is in the skills array
        const { data, error } = await supabase
          .from('users')
          .select('username, account_type, profile_picture_url, main_skill, skills, rating')
          .eq('account_type', 'freelancer')
          .or(`main_skill.eq.${decodedCategory},skills.cs.{${decodedCategory}}`);

        if (error) throw error;

        setProfiles(data || []);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };

    if (decodedCategory) {
      fetchProfiles();
    }
  }, [decodedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-pulse">Loading profiles...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {decodedCategory} Experts
          </h1>
          <p className="text-gray-600">
            Found {profiles.length} freelancer{profiles.length !== 1 ? 's' : ''} with {decodedCategory} expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Link 
              key={profile.username}
              href={`/profile/${profile.username}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start space-x-4">
                {profile.profile_picture_url ? (
                  <img 
                    src={profile.profile_picture_url} 
                    alt={profile.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xl">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {profile.username}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {profile.main_skill}
                  </p>
                  {profile.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-sm text-gray-600">
                        {profile.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="text-sm text-gray-500">
                        +{profile.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No freelancers found
            </h2>
            <p className="text-gray-600">
              There are currently no freelancers with {decodedCategory} expertise.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 