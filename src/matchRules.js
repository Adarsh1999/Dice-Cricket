export const getInningsVictoryMargin = ({
    firstInningsScore,
    secondInningsScore,
    thirdInningsScore,
    thirdInningsWickets,
}) => {
    if (thirdInningsWickets !== 10) {
        return null;
    }

    const margin = secondInningsScore - firstInningsScore - thirdInningsScore;
    return margin > 0 ? margin : null;
};

export const getInningsVictoryResult = (team, margin) =>
    `${team} won by an innings and ${margin} ${margin === 1 ? 'run' : 'runs'}`;
