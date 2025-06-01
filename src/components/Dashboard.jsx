// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  CogIcon,
  LogoutIcon,
  ChartBarIcon,
  CalendarIcon,
  ScaleIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    consultations: 0,
    documents: 0,
    savedArticles: 0,
    communityPosts: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'consultations', label: 'Consultations', icon: ChatBubbleLeftRightIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
    { id: 'saved', label: 'Saved Articles', icon: BookOpenIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon },
  ];

  const quickActions = [
    {
      title: 'Ask Legal Question',
      description: 'Get instant AI-powered legal advice',
      icon: QuestionMarkCircleIcon,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/legal-ai')
    },
    {
      title: 'Generate Document',
      description: 'Create legal documents instantly',
      icon: DocumentTextIcon,
      color: 'from-green-500 to-green-600',
      action: () => navigate('/document-generator')
    },
    {
      title: 'Book Consultation',
      description: 'Connect with expert lawyers',
      icon: CalendarIcon,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/book-consultation')
    },
    {
      title: 'Learn Law',
      description: 'Access legal resources',
      icon: ScaleIcon,
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/learn-law')
    }
  ];

  const recentActivity = [
    { id: 1, type: 'consultation', title: 'Legal consultation with Adv. Sharma', time: '2 hours ago' },
    { id: 2, type: 'document', title: 'Generated Rental Agreement', time: '1 day ago' },
    { id: 3, type: 'article', title: 'Saved article on Property Rights', time: '3 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user?.name || 'User'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogoutIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="px-8 py-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
          </header>

          {/* Content */}
          <main className="p-8">
            {activeTab === 'overview' && <OverviewTab stats={stats} quickActions={quickActions} recentActivity={recentActivity} />}
            {activeTab === 'profile' && <ProfileTab user={user} />}
            {activeTab === 'consultations' && <ConsultationsTab />}
            {activeTab === 'documents' && <DocumentsTab />}
            {activeTab === 'appointments' && <AppointmentsTab />}
            {activeTab === 'saved' && <SavedArticlesTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats, quickActions, recentActivity }) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Consultations"
          value={stats.consultations}
          icon={ChatBubbleLeftRightIcon}
          trend="+12%"
          color="blue"
        />
        <StatsCard
          title="Documents"
          value={stats.documents}
          icon={DocumentTextIcon}
          trend="+5%"
          color="green"
        />
        <StatsCard
          title="Saved Articles"
          value={stats.savedArticles}
          icon={BookOpenIcon}
          trend="+8%"
          color="purple"
        />
        <StatsCard
          title="Community Posts"
          value={stats.communityPosts}
          icon={StarIcon}
          trend="+15%"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {activity.type === 'consultation' && <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    {activity.type === 'document' && <DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    {activity.type === 'article' && <BookOpenIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
                <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, trend, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          {trend}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {title}
      </p>
    </div>
  );
}