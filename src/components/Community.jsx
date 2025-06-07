// src/pages/Community.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Icon Components
const DiscussionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExpertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const LikeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
  </svg>
);

const CommentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.684C18.114 16.062 18 16.518 18 17c0 .482.114.938.316 1.342m0-2.684a3 3 0 110 2.684M9.316 10.658C9.114 10.062 9 9.518 9 9c0-.482.114-.938.316-1.342m9.368 1.342C18.886 9.562 19 10.018 19 10.5c0 .482-.114.938-.316 1.342" />
  </svg>
);

// const SearchIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//   </svg>
// );

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample data
  const categories = [
    { id: 'all', name: 'All Topics', count: 1234 },
    { id: 'criminal', name: 'Criminal Law', count: 342, color: 'red' },
    { id: 'civil', name: 'Civil Law', count: 289, color: 'blue' },
    { id: 'family', name: 'Family Law', count: 198, color: 'purple' },
    { id: 'property', name: 'Property Law', count: 176, color: 'green' },
    { id: 'business', name: 'Business Law', count: 145, color: 'yellow' },
    { id: 'tax', name: 'Tax Law', count: 84, color: 'orange' },
  ];

  const discussions = [
    {
      id: 1,
      title: "Understanding the new amendments in Criminal Procedure Code",
      author: "Rajesh Kumar",
      authorAvatar: "RK",
      authorBadge: "Legal Expert",
      category: "criminal",
      content: "The recent amendments to the CrPC have brought significant changes...",
      likes: 234,
      comments: 45,
      shares: 12,
      time: "2 hours ago",
      isPinned: true,
    },
    {
      id: 2,
      title: "How to file for divorce: A step-by-step guide",
      author: "Priya Sharma",
      authorAvatar: "PS",
      authorBadge: "Family Lawyer",
      category: "family",
      content: "Filing for divorce can be a complex process. Here's a comprehensive guide...",
      likes: 189,
      comments: 67,
      shares: 23,
      time: "5 hours ago",
    },
    {
      id: 3,
      title: "Property dispute resolution: Alternative methods",
      author: "Amit Verma",
      authorAvatar: "AV",
      category: "property",
      content: "When dealing with property disputes, court litigation isn't the only option...",
      likes: 156,
      comments: 34,
      shares: 8,
      time: "1 day ago",
    },
  ];

  const questions = [
    {
      id: 1,
      title: "Can I claim maintenance after mutual divorce?",
      author: "Anonymous",
      category: "family",
      content: "I'm going through a mutual divorce. Can I still claim maintenance?",
      answers: 5,
      views: 234,
      time: "3 hours ago",
      isAnswered: true,
      bestAnswer: {
        author: "Adv. Meera Patel",
        content: "Yes, maintenance can be claimed even in mutual divorce...",
        likes: 45,
      },
    },
    {
      id: 2,
      title: "What documents are needed for property registration?",
      author: "Suresh M",
      category: "property",
      content: "I'm buying my first property. What all documents do I need?",
      answers: 3,
      views: 189,
      time: "6 hours ago",
      isAnswered: false,
    },
  ];

  const experts = [
    {
      id: 1,
      name: "Adv. Meera Patel",
      avatar: "MP",
      specialization: "Family Law",
      experience: "15 years",
      rating: 4.8,
      consultations: 342,
      bio: "Specializing in divorce, custody, and matrimonial disputes",
      isOnline: true,
    },
    {
      id: 2,
      name: "Adv. Rajesh Khanna",
      avatar: "RK",
      specialization: "Criminal Law",
      experience: "20 years",
      rating: 4.9,
      consultations: 567,
      bio: "Expert in criminal defense and bail matters",
      isOnline: false,
    },
    {
      id: 3,
      name: "Adv. Priya Singh",
      avatar: "PS",
      specialization: "Property Law",
      experience: "12 years",
      rating: 4.7,
      consultations: 289,
      bio: "Property registration, disputes, and real estate law",
      isOnline: true,
    },
  ];

  const trendingTopics = [
    { id: 1, title: "New Labor Code 2024", posts: 45 },
    { id: 2, title: "Digital Evidence in Court", posts: 38 },
    { id: 3, title: "Women's Rights Amendment", posts: 32 },
    { id: 4, title: "Cyber Crime Prevention", posts: 28 },
    { id: 5, title: "GST Updates 2024", posts: 24 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Legal Community</h1>
          <p className="text-xl opacity-90">Connect, discuss, and learn from legal experts and peers</p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search discussions, questions, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                               className="w-full px-12 py-4 rounded-lg text-gray-900 placeholder-gray-500 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
              {/* <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                <FilterIcon className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'discussions', label: 'Discussions', icon: DiscussionIcon },
              { id: 'questions', label: 'Q&A', icon: QuestionIcon },
              { id: 'experts', label: 'Legal Experts', icon: ExpertIcon },
              { id: 'trending', label: 'Trending', icon: TrendingIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Community Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Members</span>
                    <span className="font-semibold text-gray-900 dark:text-white">12,543</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Online Now</span>
                    <span className="font-semibold text-green-600">347</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Discussions</span>
                    <span className="font-semibold text-gray-900 dark:text-white">3,892</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Answers</span>
                    <span className="font-semibold text-gray-900 dark:text-white">8,234</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="block text-blue-600 hover:underline text-sm">Community Guidelines</a>
                <a href="#" className="block text-blue-600 hover:underline text-sm">How to Ask Questions</a>
                <a href="#" className="block text-blue-600 hover:underline text-sm">Become a Verified Expert</a>
                <a href="#" className="block text-blue-600 hover:underline text-sm">Report Content</a>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Create New Post Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate('/community/new-post')}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New {activeTab === 'discussions' ? 'Discussion' : 'Question'}
              </button>
            </div>

            {/* Discussions Tab */}
            {activeTab === 'discussions' && (
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/community/discussion/${discussion.id}`)}
                  >
                    {/* Pinned Badge */}
                    {discussion.isPinned && (
                      <div className="flex items-center gap-1 text-amber-600 text-sm mb-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                        <span className="font-medium">Pinned</span>
                      </div>
                    )}

                    {/* Discussion Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold`}>
                          {discussion.authorAvatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{discussion.author}</h4>
                            {discussion.authorBadge && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                                {discussion.authorBadge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{discussion.time}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        discussion.category === 'criminal' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        discussion.category === 'civil' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                        discussion.category === 'family' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                        discussion.category === 'property' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {categories.find(c => c.id === discussion.category)?.name}
                      </span>
                    </div>

                    {/* Discussion Content */}
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      {discussion.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{discussion.content}</p>

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                        <LikeIcon />
                        <span>{discussion.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                        <CommentIcon />
                        <span>{discussion.comments}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                        <ShareIcon />
                        <span>{discussion.shares}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Q&A Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/community/question/${question.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Question Stats */}
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className={`px-3 py-1 rounded-lg ${
                          question.isAnswered ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          <div className="text-lg font-semibold">{question.answers}</div>
                          <div className="text-xs">answers</div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {question.views} views
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                          {question.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{question.content}</p>
                        
                        {/* Best Answer Preview */}
                        {question.bestAnswer && (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">Best Answer by {question.bestAnswer.author}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{question.bestAnswer.content}</p>
                          </div>
                        )}

                        {/* Question Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Asked by {question.author}</span>
                            <span>{question.time}</span>
                          </div>
                                                    <span className={`px-3 py-1 text-xs rounded-full ${
                            question.category === 'criminal' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                            question.category === 'civil' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                            question.category === 'family' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                            question.category === 'property' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {categories.find(c => c.id === question.category)?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Legal Experts Tab */}
            {activeTab === 'experts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {experts.map((expert) => (
                  <div
                    key={expert.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/community/expert/${expert.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Expert Avatar */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                          {expert.avatar}
                        </div>
                        {expert.isOnline && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>

                      {/* Expert Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{expert.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{expert.specialization}</p>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-medium">{expert.rating}</span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-gray-600 dark:text-gray-400">{expert.experience}</span>
                          <span className="text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-gray-600 dark:text-gray-400">{expert.consultations} consults</span>
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{expert.bio}</p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/consultation/book/${expert.id}`);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Book Consultation
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle view profile
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trending Tab */}
            {activeTab === 'trending' && (
              <div className="space-y-6">
                {/* Trending Topics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingIcon />
                    Trending Topics
                  </h3>
                  <div className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => navigate(`/community/topic/${topic.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{topic.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{topic.posts} posts</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Active Discussions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Most Active Discussions</h3>
                  <div className="space-y-4">
                    {discussions.filter(d => d.comments > 40).map((discussion) => (
                      <div
                        key={discussion.id}
                        className="border-l-4 border-blue-600 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-r-lg transition-colors"
                        onClick={() => navigate(`/community/discussion/${discussion.id}`)}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{discussion.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{discussion.author}</span>
                          <span>•</span>
                          <span>{discussion.comments} comments</span>
                          <span>•</span>
                          <span>{discussion.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Leaderboard */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Weekly Contributors</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Adv. Meera Patel", points: 450, avatar: "MP", badge: "gold" },
                      { name: "Rajesh Kumar", points: 380, avatar: "RK", badge: "silver" },
                      { name: "Priya Singh", points: 320, avatar: "PS", badge: "bronze" },
                      { name: "Amit Verma", points: 280, avatar: "AV" },
                      { name: "Sunita Sharma", points: 250, avatar: "SS" },
                    ].map((contributor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {contributor.avatar}
                            </div>
                            {contributor.badge && (
                              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                contributor.badge === 'gold' ? 'bg-yellow-400 text-yellow-900' :
                                contributor.badge === 'silver' ? 'bg-gray-300 text-gray-700' :
                                'bg-orange-400 text-orange-900'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{contributor.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{contributor.points} points this week</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Load More Button */}
            {activeTab !== 'trending' && (
              <div className="mt-8 text-center">
                <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => navigate('/community/new-post')}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}