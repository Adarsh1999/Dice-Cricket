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
    target,
}) {
    // Helper function to get player name with multiple fallbacks
    const getPlayerName = (id) => {
        let playerName = '';
        
        if (innings === 1 || innings === 3) {
            playerName = firstTeam?.[id] || players?.[id] || '';
        } else {
            playerName = secondTeam?.[id] || players?.[id] || '';
        }
        
        if (!playerName || playerName === '') {
            playerName = `Player ${id + 1}`;
        }
        
        return playerName;
    };

    const inningsLabels = {
        1: 'First Innings',
        2: 'Second Innings',
        3: 'Third Innings',
        4: 'Fourth Innings',
    };
    const inningsLabel = inningsLabels[innings] || 'Innings';
    const currentScore = scorelist?.reduce((sum, score) => sum + score, 0) || 0;
    const wicketsLost = (status || []).filter((s) => s === 1).length;
    const targetScore = typeof target === 'number'
        ? target
        : innings === 2 && typeof team1Score === 'number'
        ? team1Score + 1
        : null;

    // Calculate current partnership value
    const getCurrentPartnership = () => {
        if (!current || current.length < 2 || !fallOn || !scorelist) {
            return 0;
        }
        
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
                status: 'BATTING'
            };
        }
        
        return {
            icon: '🏃',
            bgClass: 'from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600',
            textClass: 'text-gray-700 dark:text-gray-200',
            borderClass: 'border-gray-200 dark:border-gray-500',
            status: 'WAITING'
        };
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Unified Scorecard Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-2xl shadow-2xl border-4 border-white/20 dark:border-indigo-800">
                
                {/* Main Score Display */}
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                        {/* Team Info */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-white/20 backdrop-blur rounded-full p-2 sm:p-3 shadow-xl">
                                <span className="text-2xl sm:text-3xl">🏏</span>
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 text-center sm:text-left">
                                    {inningsLabel}
                                </h1>
                                <p className="text-indigo-100 text-sm sm:text-base md:text-lg font-semibold text-center sm:text-left">
                                    {battingTeamName || (innings === 1 || innings === 3 ? 'Team 1' : 'Team 2')} Batting
                                </p>
                            </div>
                        </div>
                        
                        {/* Live Score Badge with compact overs pill */}
                        <div className="bg-white/30 backdrop-blur rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-xl w-full sm:w-auto">
                            <div className="text-center">
                                <div className="text-white/80 text-sm font-bold mb-1">LIVE SCORE</div>
                                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
                                    <span>
                                        {currentScore}
                                        <span className="text-white">/{wicketsLost}</span>
                                    </span>
                                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/30">
                                        ⏰ {currentOver || 0}.{ballInOver || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Left: Target (2nd innings) or Wickets (1st innings) */}
                        <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center shadow-lg">
                            {targetScore ? (
                                <>
                                    <div className="text-white/80 text-sm font-bold mb-2">🎯 TARGET</div>
                                    <div className="text-xl sm:text-2xl font-black text-white">{targetScore}</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-white/80 text-sm font-bold mb-2">⚡ WICKETS</div>
                                    <div className="text-xl sm:text-2xl font-black text-white">{wicketsLost}/10</div>
                                </>
                            )}
                        </div>

                        {/* Middle: Partnership */}
                        <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center shadow-lg">
                            <div className="text-white/80 text-sm font-bold mb-2">🤝 PARTNERSHIP</div>
                            <div className="text-xl sm:text-2xl font-black text-white">
                                {getCurrentPartnership()}
                            </div>
                        </div>

                        {/* Right: Need (2nd innings) or Overs (1st innings) */}
                        <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center shadow-lg">
                            {targetScore ? (
                                <>
                                    <div className="text-white/80 text-sm font-bold mb-2">🏃 NEED</div>
                                    <div className="text-xl sm:text-2xl font-black text-white">
                                        {Math.max(0, targetScore - currentScore)}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-white/80 text-sm font-bold mb-2">⏰ OVERS</div>
                                    <div className="text-xl sm:text-2xl font-black text-white">{currentOver || 0}.{ballInOver || 0}</div>
                                </>
                            )}
                        </div>
                    </div>
                    

                    {/* Current Batsmen */}
                    {current && current.length >= 2 && (
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                            {current.slice(0, 2).map((playerId, idx) => (
                                <div key={playerId} className="bg-white/20 backdrop-blur rounded-xl px-3 sm:px-4 py-2 shadow-lg flex items-center gap-2 sm:gap-3">
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
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-b-2xl shadow-2xl border-l-4 border-r-4 border-b-4 border-indigo-200 dark:border-indigo-800">
                <div className="p-5 sm:p-6">
                    
                    {/* Partnership details shown in header to avoid duplication */}

                    {/* All Players Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                        {scorelist && scorelist.map((score, id) => {
                            const playerStatus = getPlayerStatus(id);
                            const playerName = getPlayerName(id);
                            
                            return (
                                <div 
                                    key={id}
                                    className={`player-card relative bg-gradient-to-r ${playerStatus.bgClass} rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-lg border-2 ${playerStatus.borderClass} transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
                                >
                                    {/* Player Number Badge */}
                                    <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
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
                                        <div className={`font-bold text-sm sm:text-base md:text-lg ${playerStatus.textClass} mb-1 truncate`}>
                                            {playerName}
                                        </div>
                                        <div className={`text-xs sm:text-sm font-semibold ${playerStatus.textClass} opacity-80 mb-1 sm:mb-2`}>
                                            {playerStatus.status}
                                        </div>
                                        
                                        {/* Score Display */}
                                        <div className="flex items-center justify-between">
                                            <div className={`text-xl sm:text-2xl md:text-3xl font-black ${playerStatus.textClass}`}>
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
                        <div className="mt-4 sm:mt-6 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-red-200 dark:border-red-900 shadow-xl">
                            <div className="text-center mb-4">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-800 dark:text-red-300 mb-2">
                                    ⚡ Fall of Wickets
                                </h3>
                                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1.5 rounded-lg shadow inline-block text-sm font-semibold">
                                    <span className="text-lg font-bold">
                                        {playerFell.filter(data => data !== '').length} wickets fallen
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                                {playerFell.map((data, id) =>
                                    data !== '' ? (
                                        <div key={id} className="bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-700 dark:to-orange-700 text-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg border border-red-300 dark:border-red-600">
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
                        <div className="mt-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-xl p-4 border border-green-200 dark:border-green-700">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-green-800 dark:text-green-300">🏆 First Innings Total</span>
                                <span className="text-2xl font-black text-green-800 dark:text-green-300">{team1Score} / 10</span>
                            </div>
                        </div>
                    )}
                    
                    {team2Score && innings === 2 && (
                        <div className="mt-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-blue-800 dark:text-blue-300">🎯 Second Innings Total</span>
                                <span className="text-2xl font-black text-blue-800 dark:text-blue-300">{team2Score} / {team2wic}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ScoreCard;
