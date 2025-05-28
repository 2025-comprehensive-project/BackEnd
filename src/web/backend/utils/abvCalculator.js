const convertToMl = (amountStr) => {
  if (!amountStr || typeof amountStr !== "string") return 0;

  const parts = amountStr.toLowerCase().split(",").map(s => s.trim());
  let total = 0;

  for (const part of parts) {
    const match = part.match(/(\d+(\.\d+)?|\d+\/\d+)/);
    if (!match) continue;

    let value = match[0];
    if (value.includes("/")) {
      const [num, denom] = value.split("/");
      value = parseFloat(num) / parseFloat(denom);
    } else {
      value = parseFloat(value);
    }

    if (part.includes("oz")) total += value * 30;
    else if (part.includes("dash")) total += value * 5;
    else if (part.includes("ml")) total += value;
    else total += value * 30;
  }

  return total || 0;
};

  
  const calculateAbv = (ingredientList, ingredientInfo, glass_type) => {
    let totalMl = 0;
    let totalAlcoholMl = 0;
  
    for (const { id, amountStr } of ingredientList) {
      const abv = ingredientInfo[id]?.abv || 0;
      const ml = convertToMl(amountStr);
      totalMl += ml;
      totalAlcoholMl += ml * (abv / 100);
    }
  
    // filling을 고려한 희석: 롱드링크 잔일 경우 희석량 추가
    if (glass_type === 'long_drink') {
      totalMl += 100;
    }
  
    if (totalMl === 0) return 0;
    const rawAbv = (totalAlcoholMl / totalMl) * 100;
    const roundedAbv = Math.round(rawAbv / 5) * 5;
    return roundedAbv;
  };
  
  module.exports = { convertToMl, calculateAbv };
  