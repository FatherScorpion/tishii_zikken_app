// シード付き乱数生成クラス
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export function generateOrder(userId, mode, totalCells = 35) {
  // シード値を生成
  const seedString = `${userId}_${mode}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = ((seed << 5) - seed) + seedString.charCodeAt(i);
    seed = seed & seed; // 32bit整数に変換
  }
  
  // 絶対値にして正の数にする
  seed = Math.abs(seed);
  
  const rng = new SeededRandom(seed);
  const order = Array.from({ length: totalCells }, (_, i) => i + 1);
  
  // Fisher-Yatesシャッフル
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  
  return order;
}

