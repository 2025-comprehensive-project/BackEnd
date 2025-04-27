function parseAmount(amountStr) {
  if (!amountStr) return 0;

  const lower = amountStr.toLowerCase();
  let num = 0;

  const fractionMatch = lower.match(/(\d+)\s*\/\s*(\d+)/);
  if (fractionMatch) {
    num = parseFloat(fractionMatch[1]) / parseFloat(fractionMatch[2]);
  } else {
    const numMatch = lower.match(/[\d.]+/);
    if (numMatch) num = parseFloat(numMatch[0]);
  }

  if (lower.includes('oz')) return num * 30;
  if (lower.includes('dash')) return num * 5;
  if (lower.includes('ml')) return num;
  return num * 30;
}

function calculateFlavorAndNotes(ingredients, flavorDataMap) {
  let totalMl = 0;
  let sweetnessSum = 0;
  let sournessSum = 0;
  let bitternessSum = 0;

  const noteScores = {};

  ingredients.forEach(({ id, amountStr }) => {
    const ml = parseAmount(amountStr);
    totalMl += ml;

    const data = flavorDataMap[id];
    if (!data) return;

    sweetnessSum += data.sweetness * ml;
    sournessSum += data.sourness * ml;
    bitternessSum += data.bitterness * ml;

    const notes = data.note_categories?.split(',').map(n => n.trim());
    notes?.forEach(note => {
      if (note === 'Spirit') return; // 향미에서 Spirit 제외
      if (!noteScores[note]) noteScores[note] = 0;
      noteScores[note] += ml;
    });
  });

  const topNotes = Object.entries(noteScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([note]) => note);

  return {
    sweetness: totalMl ? Math.min(5, Math.max(0, Math.round(sweetnessSum / totalMl))) : 0,
    sourness: totalMl ? Math.min(5, Math.max(0, Math.round(sournessSum / totalMl))) : 0,
    bitterness: totalMl ? Math.min(5, Math.max(0, Math.round(bitternessSum / totalMl))) : 0,
    flavorNotes: topNotes
  };
}

module.exports = { parseAmount, calculateFlavorAndNotes };
