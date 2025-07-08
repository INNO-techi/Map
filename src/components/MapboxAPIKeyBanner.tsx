import React, { useState } from 'react';
import { Key, ExternalLink, X, AlertCircle } from 'lucide-react';

interface MapboxAPIKeyBannerProps {
  onDismiss: () => void;
}

const MapboxAPIKeyBanner: React.FC<MapboxAPIKeyBannerProps> = ({ onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 mb-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-blue-900 text-base">Mapbox Token Required</h3>
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-blue-700 text-sm leading-relaxed">
              Configure your Mapbox access token to unlock intelligent route planning with traffic data.
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 touch-manipulation"
            >
              {isExpanded ? 'Hide Setup Guide' : 'Show Setup Guide'}
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0 ml-3 p-2 hover:bg-blue-100 rounded-lg touch-manipulation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-blue-200">
          <div className="space-y-4 text-sm text-blue-800">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <strong className="text-blue-900">Create Mapbox Account</strong>
              </div>
              <p className="mb-2">Sign up for a free Mapbox account:</p>
              <a
                href="https://account.mapbox.com/auth/signup/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors touch-manipulation"
              >
                Sign Up Free <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <strong className="text-blue-900">Get Your Access Token</strong>
              </div>
              <p className="mb-2">Visit your account page to get your default public token:</p>
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors touch-manipulation"
              >
                Get Token <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <strong className="text-blue-900">Configure Environment</strong>
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                VITE_MAPBOX_ACCESS_TOKEN=your_access_token_here
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <AlertCircle className="w-4 h-4" />
                <strong className="text-xs">Free Tier Benefits:</strong>
              </div>
              <ul className="text-xs text-emerald-700 mt-1 space-y-1">
                <li>• 50,000 map loads per month</li>
                <li>• 100,000 geocoding requests</li>
                <li>• 25,000 directions requests</li>
                <li>• No credit card required</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxAPIKeyBanner;