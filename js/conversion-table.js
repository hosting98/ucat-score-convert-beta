const conversionTable = {
    VR: {
        '0': 300, '14': 330, '18': 350, '20': 380, '25': 400,
        '27': 430, '32': 450, '34': 480, '39': 500, '41': 530,
        '45': 550, '48': 580, '52': 600, '55': 630, '59': 650,
        '61': 680, '66': 700, '68': 730, '73': 750, '75': 780,
        '80': 800, '82': 830, '86': 850, '89': 880, '93': 900
    },
    DM: {
        '0': 300, '15': 330, '19': 350, '22': 380, '26': 400,
        '30': 430, '33': 450, '37': 480, '41': 500, '44': 530,
        '48': 550, '52': 580, '56': 600, '59': 630, '63': 650,
        '67': 680, '70': 700, '74': 730, '78': 750, '81': 780,
        '85': 800, '89': 830, '93': 850, '96': 880, '100': 900
    },
    QR: {
        '0': 300, '11': 330, '17': 350, '22': 380, '28': 400,
        '33': 430, '39': 450, '44': 480, '47': 500, '50': 530,
        '53': 550, '56': 580, '58': 600, '61': 630, '64': 650,
        '67': 680, '69': 700, '72': 730, '75': 750, '78': 780,
        '81': 800, '83': 830, '86': 850, '89': 880, '92': 900
    }
};

function findClosestScore(percentage, section) {
    const table = conversionTable[section];
    const percentages = Object.keys(table).map(Number);
    
    let closest = percentages.reduce((prev, curr) => {
        return Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev;
    });
    
    return table[closest];
}

function calculateScaledScore(raw, total, section) {
    const percentage = Math.round((raw / total) * 100);
    return findClosestScore(percentage, section);
}