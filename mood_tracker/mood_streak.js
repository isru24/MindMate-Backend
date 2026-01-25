export default function moodStreak(moods) {
    if (!moods.length) {
        return 0;
    }
    let streak = 0;
    let currentDate = new Date();

    for (const mood of moods) {
        const moodDate = new Date(mood.date);
        const diffDays = Math.floor(
            (currentDate - moodDate) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 0 || diffDays === 1) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

