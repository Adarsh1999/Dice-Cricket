/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import React from 'react';
import './ScoreCard.css';
import 'tailwindcss/tailwind.css';

function ScoreCard({
    scorelist,
    current,
    status,
    striker,
    firstTeam,
    secondTeam,
    innings,
    team1Score,
    team2Score,
    team2wic,
    players,
    currentOver,
    ballInOver,
    fallOn,
    playerFell,
    battingTeamName,
}) {
    // Helper function to get player name with multiple fallbacks
    const getPlayerName = (id) => {
        let playerName = '';
        
        if (innings === 1) {
            playerName = firstTeam?.[id] || players?.[id] || '';
        } else {
            playerName = secondTeam?.[id] || players?.[id] || '';
        }
        
        if (!playerName || playerName === '') {
            playerName = `Player ${id + 1}`;
        }
        
        return playerName;
    };

    // Calculate current partnership value
    const getCurrentPartnership = () => {
        if (!current || current.length < 2 || !fallOn || !scorelist) {
            return 0;
        }
        
        const currentScore = scorelist.reduce((sum, score) => sum + score, 0);
        
        // Find the last wicket that fell (highest score in fallOn array that has a value)
        let lastWicketScore = 0;
        for (let i = fallOn.length - 1; i >= 0; i--) {
            if (fallOn[i] !== '' && fallOn[i] !== undefined) {
                lastWicketScore = parseInt(fallOn[i]) || 0;
                break;
            }
        }
        
        return Math.max(0, currentScore - lastWicketScore);
    };

    // Get player status icon and styling
    const getPlayerStatus = (id) => {
        const isCurrentBatsman = current && current.includes(id);
        const isOut = status && status[id] === 1;
        const isStriker = id === striker;
        
        // Fixed striker/batsman logic - reverted to original working state
        
        if (isOut) {
            return {
                icon: '❌',
                bgClass: 'from-red-500 to-red-700',
                textClass: 'text-white',
                borderClass: 'border-red-300',
                status: 'OUT'
            };
        }
        
        if (isStriker) {
            return {
                icon: '🏏',
                bgClass: 'from-amber-600 to-orange-700',
                textClass: 'text-white',
                borderClass: 'border-yellow-300',
                status: 'STRIKER'
            };
        }
        
        if (isCurrentBatsman) {
            return {
                icon: '⚡',
                bgClass: 'from-green-400 to-emerald-500',
                textClass: 'text-white',
                borderClass: 'border-green-300',
                status: 'BATTING'
            };
        }
        
        return {
            icon: '🏃',
            bgClass: 'from-gray-100 to-gray-200',
            textClass: 'text-gray-700',
            borderClass: 'border-gray-200',
            status: 'WAITING'
        };
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Beautiful Unified Scorecard Header - Sticky */}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-2xl shadow-2xl border-4 border-white/20">
                
                {/* Main Score Display */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        {/* Team Info */}
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur rounded-full p-3 shadow-xl">
                                <span className="text-3xl">🏏</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white mb-1">
                                    {innings === 1 ? 'First Innings' : 'Second Innings'}
                                </h1>
                                <p className="text-indigo-100 text-lg font-semibold">
                                    {battingTeamName || (innings === 1 ? 'Team 1' : 'Team 2')} Batting
                                </p>
                            </div>
                        </div>
                        
                        {/* Live Score Badge with compact overs pill */}
                        <div className="bg-white/30 backdrop-blur rounded-2xl px-6 py-3 shadow-xl">
                            <div className="text-center">
                                <div className="text-white/80 text-sm font-bold mb-1">LIVE SCORE</div>
                                <div className="text-4xl font-black text-white flex items-center gap-3 justify-center">
                                    <span>
                                        {scorelist?.reduce((sum, score) => sum + score, 0) || 0}
                                        <span className="text-white">/{status?.filter(s => s === 1).length || 0}</span>
                                    </span>
                                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/30">
                                        ⏰ {currentOver || 0}.{ballInOver || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Left: Target (2nd innings) or Wickets (1st innings) */}
                        <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center shadow-lg">
                            {innings === 2 ? (
                                <>
                                    <div className="text-white/80 text-sm font-bold mb-2">🎯 TARGET</div>
                                    <div className="text-2xl font-black text-white">{(team1Score || 0) + 1}</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-white/80 text-sm font-bold mb-2">⚡ WICKETS</div>
                                    <div className="text-2xl font-black text-white">{status?.filter(s => s === 1).length || 0}/10</div>
                                </>
                            )}
                        </div>

                        {/* Middle: Partnership */}
                        <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center shadow-lg">
                            <div className="text-white/80 text-sm font-bold mb-2">🤝 PARTNERSHIP</div>
                            <div className="text-2xl font-black text-white">
                                {current && current.length >= 2 ? 
                                    (scorelist?.[current[0]] || 0) + (scorelist?.[current[1]] || 0) : 0}
                            </div>
                        </div>

                        {/* Right: Need (2nd innings) or Overs (1st innings) */}
                        <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center shadow-lg">
                            {innings === 2 ? (
                                <>
                                    <div className="text-white/80 text-sm font-bold mb-2">🏃 NEED</div>
                                    <div className="text-2xl font-black text-white">
                                        {Math.max(0, ((team1Score || 0) + 1) - (scorelist?.reduce((sum, score) => sum + score, 0) || 0))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-white/80 text-sm font-bold mb-2">⏰ OVERS</div>
                                    <div className="text-2xl font-black text-white">{currentOver || 0}.{ballInOver || 0}</div>
                                </>
                            )}
                        </div>
                    </div>
                    

                    {/* Current Batsmen */}
                    {current && current.length >= 2 && (
                        <div className="mt-4 flex items-center justify-center gap-4">
                            {current.slice(0, 2).map((playerId, idx) => (
                                <div key={playerId} className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 shadow-lg flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${playerId === striker ? 'bg-yellow-300 animate-pulse' : 'bg-green-300'}`}></div>
                                    <span className="text-white font-bold">
                                        {getPlayerName(playerId)}
                                    </span>
                                    <span className="text-white/80 text-sm">
                                        {scorelist?.[playerId] || 0}*
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Players Grid */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-b-2xl shadow-2xl border-l-4 border-r-4 border-b-4 border-indigo-200">
                <div className="p-6">
                    
                    {/* Partnership details shown in header to avoid duplication */}

                    {/* All Players Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scorelist && scorelist.map((score, id) => {
                            const playerStatus = getPlayerStatus(id);
                            const playerName = getPlayerName(id);
                            
                            return (
                                <div 
                                    key={id}
                                    className={`relative bg-gradient-to-r ${playerStatus.bgClass} rounded-2xl p-4 shadow-lg border-2 ${playerStatus.borderClass} transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
                                >
                                    {/* Player Number Badge */}
                                    <div className="absolute -top-2 -left-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                                        {id + 1}
                                    </div>
                                    
                                    {/* Status Badge */}
                                    <div className="absolute -top-2 -right-2">
                                        <div className="bg-white rounded-full p-1 shadow-lg">
                                            <span className="text-lg">{playerStatus.icon}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Player Info */}
                                    <div className="mt-2">
                                        <div className={`font-bold text-lg ${playerStatus.textClass} mb-1`}>
                                            {playerName}
                                        </div>
                                        <div className={`text-sm font-semibold ${playerStatus.textClass} opacity-80 mb-2`}>
                                            {playerStatus.status}
                                        </div>
                                        
                                        {/* Score Display */}
                                        <div className="flex items-center justify-between">
                                            <div className={`text-3xl font-black ${playerStatus.textClass}`}>
                                                {score}
                                            </div>
                                            
                                            {/* Performance Indicator */}
                                            <div className="flex flex-col items-end">
                                                <div className={`text-xs font-bold ${playerStatus.textClass} opacity-70`}>
                                                    RUNS
                                                </div>
                                                {score >= 50 && (
                                                    <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold mt-1">
                                                        50+
                                                    </div>
                                                )}
                                                {score >= 30 && score < 50 && (
                                                    <div className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-bold mt-1">
                                                        30+
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Striker Highlight */}
                                    {id === striker && (
                                        <div className="absolute inset-0 rounded-2xl border-4 border-yellow-300 animate-pulse pointer-events-none"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Removed duplicate Team Total Summary cards - info shown in header */}

                    {/* Fall of Wickets - Enhanced */}
                    {playerFell && playerFell.filter(data => data !== '').length > 0 && (
                        <div className="mt-6 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-5 border border-red-200 shadow-xl">
                            <div className="text-center mb-4">
                                <h3 className="text-2xl font-bold text-red-800 mb-2">
                                    ⚡ Fall of Wickets
                                </h3>
                                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1.5 rounded-lg shadow inline-block text-sm font-semibold">
                                    <span className="text-lg font-bold">
                                        {playerFell.filter(data => data !== '').length} wickets fallen
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {playerFell.map((data, id) =>
                                    data !== '' ? (
                                        <div key={id} className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-3 shadow-lg border border-red-300">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold truncate">
                                                        💥 {data}
                                                    </div>
                                                    <div className="text-[11px] font-semibold opacity-90">
                                                        Wicket #{id + 1}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-black leading-none">
                                                        {fallOn[id]}
                                                    </div>
                                                    <div className="text-[11px] font-semibold opacity-90">
                                                        Score
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null,
                                )}
                            </div>
                        </div>
                    )}

                    {/* Legacy Total Rows (for backward compatibility) */}
                    {team1Score && innings === 1 && (
                        <div className="mt-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border border-green-200">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-green-800">🏆 First Innings Total</span>
                                <span className="text-2xl font-black text-green-800">{team1Score} / 10</span>
                            </div>
                        </div>
                    )}
                    
                    {team2Score && innings === 2 && (
                        <div className="mt-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 border border-blue-200">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-blue-800">🎯 Second Innings Total</span>
                                <span className="text-2xl font-black text-blue-800">{team2Score} / {team2wic}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ScoreCard;
