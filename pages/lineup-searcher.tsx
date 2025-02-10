'use client'
import { useState } from 'react';
import Link from 'next/link';
import { FESTIVALS } from '../lib/festivals';
import { analyzeLineup } from '../app/actions/analyze-lineup';

// Add interface for Festival type
interface Festival {
  id: string;
  name: string;
}

// Add type annotation for FESTIVALS
const festivals: Festival[] = Object.values(FESTIVALS).map(festival => ({
  id: festival.id,
  name: festival.name
}));

export default function LineupSearcher() {
  const [selectedFestival, setSelectedFestival] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showLineup, setShowLineup] = useState(false);

  const handleFestivalSelect = async (festivalId: string) => {
    setSelectedFestival(festivalId);
    setLoading(true);

    try {
      const result = await analyzeLineup(festivalId);
      console.log("result: ", result);
      setRecommendation(result.recommendation);
    } catch (error) {
      console.error('Error:', error);
      setRecommendation('Sorry, there was an error analyzing the lineup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Festival Lineup Matcher</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="festival" className="block text-sm font-medium mb-2">
            Select a Festival
          </label>
          <select
            id="festival"
            className="w-full max-w-md px-3 py-2 border rounded-lg"
            value={selectedFestival}
            onChange={(e) => handleFestivalSelect(e.target.value)}
          >
            <option value="">Choose a festival...</option>
            {festivals.map((festival) => (
              <option key={festival.id} value={festival.id}>
                {festival.name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-gray-600">Analyzing lineup...</div>
        )}

        {recommendation && !loading && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-gray-700 prose prose-sm max-w-none">
              <h1 className="text-xl font-bold mb-4">Festival Analysis</h1>
              <h2 className="text-lg font-semibold mb-2">Top Artists You will Love</h2>
              <div className="list-disc list-inside space-y-2 mb-4">
                {recommendation.split('\n').map((line, index) => (
                  <p key={index} className="ml-4">• {line.trim()}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedFestival && (
          <div className="mt-4">
            <button
              onClick={() => setShowLineup(!showLineup)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {showLineup ? 'Hide Full Lineup' : 'Show Full Lineup'}
            </button>
            {showLineup && (
              <div className="mt-2 bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">Full Lineup</h3>
                <ul className="list-disc list-inside space-y-1">
                  {FESTIVALS[selectedFestival].artists.map((artist: string) => (
                    <li key={artist} className="text-gray-700">
                      {artist}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}