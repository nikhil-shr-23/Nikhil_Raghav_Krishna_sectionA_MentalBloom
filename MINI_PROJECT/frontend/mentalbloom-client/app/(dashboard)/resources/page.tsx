'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
}

// Sample resources data
const sampleResources: Resource[] = [
  {
    id: '1',
    title: 'Understanding Anxiety',
    description: 'Learn about the causes, symptoms, and treatments for anxiety disorders.',
    url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
    category: 'Anxiety',
    tags: ['anxiety', 'mental health', 'disorders'],
  },
  {
    id: '2',
    title: 'Mindfulness Meditation Guide',
    description: 'A comprehensive guide to mindfulness meditation practices for beginners.',
    url: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
    category: 'Mindfulness',
    tags: ['meditation', 'mindfulness', 'stress reduction'],
  },
  {
    id: '3',
    title: 'Coping with Depression',
    description: 'Strategies and techniques for managing depression symptoms.',
    url: 'https://www.helpguide.org/articles/depression/coping-with-depression.htm',
    category: 'Depression',
    tags: ['depression', 'coping strategies', 'mental health'],
  },
  {
    id: '4',
    title: 'Sleep Hygiene Tips',
    description: 'Improve your sleep quality with these evidence-based recommendations.',
    url: 'https://www.sleepfoundation.org/sleep-hygiene',
    category: 'Sleep',
    tags: ['sleep', 'insomnia', 'health'],
  },
  {
    id: '5',
    title: 'Stress Management Techniques',
    description: 'Effective ways to reduce and manage stress in your daily life.',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/basics/stress-basics/hlv-20049495',
    category: 'Stress',
    tags: ['stress', 'relaxation', 'coping'],
  },
  {
    id: '6',
    title: 'Building Resilience',
    description: 'Learn how to develop resilience to better handle life\'s challenges.',
    url: 'https://www.apa.org/topics/resilience',
    category: 'Resilience',
    tags: ['resilience', 'mental strength', 'coping'],
  },
];

// Categories with their corresponding colors
const categories = [
  { name: 'All', color: '#6BCB77' },
  { name: 'Anxiety', color: '#FEEA8C' },
  { name: 'Depression', color: '#4D96FF' },
  { name: 'Mindfulness', color: '#A0E7E5' },
  { name: 'Sleep', color: '#FF7F50' },
  { name: 'Stress', color: '#9370DB' },
  { name: 'Resilience', color: '#20B2AA' },
];

export default function ResourcesPage() {
  const [resources] = useState<Resource[]>(sampleResources);
  const [filteredResources, setFilteredResources] = useState<Resource[]>(sampleResources);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    // Filter resources based on category and search query
    let filtered = resources;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        resource =>
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredResources(filtered);
  }, [selectedCategory, searchQuery, resources]);

  const getCategoryColor = (category: string) => {
    const found = categories.find(c => c.name === category);
    return found ? found.color : '#6BCB77';
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-800">Mental Health Resources</h1>
        <p className="mt-2 text-slate-500">
          Explore our curated collection of mental health resources
        </p>

        {/* Search and filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6BCB77]"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6BCB77]"
            >
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedCategory === category.name
                  ? 'bg-opacity-100 text-white'
                  : 'bg-opacity-20 text-slate-800'
              }`}
              style={{ backgroundColor: selectedCategory === category.name ? category.color : `${category.color}33` }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Resources grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div
                    className="w-full h-2 rounded-full mb-4"
                    style={{ backgroundColor: getCategoryColor(resource.category) }}
                  />
                  <h3 className="text-lg font-medium text-slate-800">{resource.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{resource.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${getCategoryColor(resource.category)}33` }}
                    >
                      {resource.category}
                    </span>
                    {resource.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 2 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        +{resource.tags.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: getCategoryColor(resource.category) }}
                    >
                      View Resource
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500">No resources found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 text-[#4D96FF] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Need help section */}
        <div className="mt-12 bg-[#F4F9F4] rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Need personalized help?</h2>
          <p className="mt-2 text-slate-500">
            Our AI assistant can provide personalized recommendations based on your specific situation.
          </p>
          <div className="mt-4">
            <Link
              href="/chat"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#6BCB77] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6BCB77]"
            >
              Chat with AI Assistant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
