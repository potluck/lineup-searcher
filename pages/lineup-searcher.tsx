import { useState } from 'react';
import Link from 'next/link';

// This is our temporary festival data structure
interface Festival {
  id: string;
  name: string;
  artists: string[];
}

const FESTIVALS: Festival[] = [
  {
    id: 'coachella-2024',
    name: 'Coachella 2024',
    artists: ['Tyler, The Creator', 'Doja Cat', 'Lana Del Rey', 'No Doubt', 'Justice', 'Blur']
  },
  {
    id: 'glastonbury-2024',
    name: 'Glastonbury 2024',
    artists: ['Coldplay', 'Dua Lipa', 'SZA', 'Foo Fighters', 'The Killers']
  }
];

export default function LineupSearcher() {
  const [selectedFestival, setSelectedFestival] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFestivalSelect = async (festivalId: string) => {
    setSelectedFestival(festivalId);
    setLoading(true);

    try {
      const response = await fetch('/api/analyze-lineup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          festivalId,
        }),
      });

      const data = await response.json();
      setRecommendation(data.recommendation);
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
            {FESTIVALS.map((festival) => (
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
            <h2 className="text-lg font-semibold mb-2">Your Personalized Recommendation</h2>
            <p className="text-gray-700">{recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}