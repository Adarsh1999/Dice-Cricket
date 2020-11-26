export const initialState = {
    team1: null,
    team2: null,
    team1_data: {},
    team2_data: {},
    result: null,
};

// Selector

const reducer = (state, action) => {
    console.log(action);
    switch (action.type) {
        case 'SET_TEAM':
            return {
                ...state,
                team1: action.team1,
                team2: action.team2,
            };
        case 'SET_TEAM1':
            return {
                ...state,

                team1_data: action.team1_data,
            };
        case 'SET_TEAM2':
            return {
                ...state,

                team2_data: action.team2_data,
            };
        case 'SET_RESULT':
            return {
                ...state,

                result: action.result,
            };

        default:
            return state;
    }
};

export default reducer;
