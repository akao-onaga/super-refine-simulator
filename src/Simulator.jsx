import React, { useState } from "react";
import "./App.css";

// スーパー精錬データ
const SUPER_REFINING_DATA = [
  { range: [1, 20], cost: 20, dist: { 1: 0.65, 2: 0.25, 3: 0.10 } },
  { range: [21, 40], cost: 50, dist: { 2: 0.85, 3: 0.15 } },
  { range: [41, 60], cost: 100, dist: { 3: 0.85, 4: 0.125, 5: 0.02, 6: 0.005 } },
  { range: [61, 80], cost: 130, dist: { 3: 0.75, 4: 0.15, 5: 0.05, 6: 0.03, 7: 0.01, 8: 0.005, 9: 0.005 } },
  { range: [81, 100], cost: 160, dist: { 3: 0.70, 4: 0.12, 5: 0.09, 6: 0.04, 7: 0.015, 8: 0.01, 9: 0.01, 10: 0.005, 11: 0.005, 12: 0.005 } },
];

// 全体のFC強化に必要な素材数
const FC_REQUIREMENTS = [
  { name: "FC5→6", fire: 3105, refine: 197 },
  { name: "FC6→7", fire: 3726, refine: 295 },
  { name: "FC7→8", fire: 3726, refine: 414 },
];

// 兵舎のみのFC強化に必要な素材数
const FC_REQUIREMENTS_BARRACKS_ONLY = [
  { name: "FC5→6", fire: 2340, refine: 148 },
  { name: "FC6→7", fire: 2808, refine: 220 },
  { name: "FC7→8", fire: 2808, refine: 312 },
];

export default function App() {
  const [weeklyCount, setWeeklyCount] = useState(20);
  const [results, setResults] = useState([]);
  const [isBarracksOnly, setIsBarracksOnly] = useState(false); // 🔑 兵舎のみかどうか

  // シミュレーション
  const simulate = (needRefine) => {
    let totalRefine = 0;
    let totalFire = 0;
    let days = 0;

    while (totalRefine < needRefine) {
      let remaining = weeklyCount;
      let weekCounter = 1;

      // 初日まとめて
      let firstDay = Math.max(remaining - 6, 0);
      if (firstDay > 0) {
        for (let i = 0; i < firstDay; i++) {
          if (totalRefine >= needRefine) break;

          const currentCount = weekCounter;
          const entry = SUPER_REFINING_DATA.find(
            (e) => currentCount >= e.range[0] && currentCount <= e.range[1]
          );

          let exp = 0;
          for (const [count, prob] of Object.entries(entry.dist)) {
            exp += Number(count) * prob;
          }
          totalRefine += exp;

          const isHalf = weekCounter === 1;
          totalFire += isHalf ? entry.cost / 2 : entry.cost;

          weekCounter++;
          remaining--;
        }
        days += 1;
      }

      // 残り6日
      let dailyLeft = Math.min(6, remaining);
      for (let i = 0; i < dailyLeft; i++) {
        if (totalRefine >= needRefine) break;

        const currentCount = weekCounter;
        const entry = SUPER_REFINING_DATA.find(
          (e) => currentCount >= e.range[0] && currentCount <= e.range[1]
        );

        let exp = 0;
        for (const [count, prob] of Object.entries(entry.dist)) {
          exp += Number(count) * prob;
        }
        totalRefine += exp;

        totalFire += entry.cost / 2;
        weekCounter++;
        days += 1;
      }
    }

    return {
      totalRefine,
      totalFire,
      totalDays: days,
    };
  };

  // 計算
  const handleCalculate = () => {
    const DATA = isBarracksOnly ? FC_REQUIREMENTS_BARRACKS_ONLY : FC_REQUIREMENTS;

    const indivResults = DATA.map((level) => {
      const r = simulate(level.refine);
      const refineFire = Math.ceil(r.totalFire);
      return {
        name: level.name,
        baseFire: level.fire,
        refineFire: refineFire,
        totalFire: level.fire + refineFire,
        totalRefine: r.totalRefine.toFixed(2),
        totalDays: r.totalDays,
      };
    });

    const totalBaseFire = DATA.reduce((sum, lv) => sum + lv.fire, 0);
    const totalRefineFire = indivResults.reduce((sum, r) => sum + r.refineFire, 0);
    const totalRefine = indivResults.reduce((sum, r) => sum + parseFloat(r.totalRefine), 0);
    const totalDays = indivResults.reduce((sum, r) => sum + r.totalDays, 0);

    const totalResult = {
      name: isBarracksOnly ? "FC5→8（兵舎のみ累計）" : "FC5→8（累計）",
      baseFire: totalBaseFire,
      refineFire: totalRefineFire,
      totalFire: totalBaseFire + totalRefineFire,
      totalRefine: totalRefine.toFixed(2),
      totalDays: totalDays,
    };

    setResults([totalResult, ...indivResults]);
  };

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "1.5em", textAlign: "center" }}>
        スーパー製錬シミュレーター
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "10px" }}>
          週のスーパー精錬回数（1〜100）:
        </label>
        <input
          type="number"
          value={weeklyCount}
          min={1}
          max={100}
          onChange={(e) => setWeeklyCount(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "1em",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <input
            type="checkbox"
            checked={isBarracksOnly}
            onChange={(e) => setIsBarracksOnly(e.target.checked)}
            style={{ marginRight: "8px" }}
          />
          兵舎のみで計算する
        </label>
      </div>

      <button
        onClick={handleCalculate}
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "1.2em",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        計算する
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          {results.map((res) => (
            <div
              key={res.name}
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                background: res.name.includes("累計") ? "#ffe8cc" : "#fafafa",
              }}
            >
              <h3 style={{ margin: "0 0 10px" }}>{res.name}</h3>
              <p>強化素材として必要な火晶: {res.baseFire} 個</p>
              <p>スーパー精錬で消費する火晶: {res.refineFire} 個</p>
              <p><strong>総火晶必要数: {res.totalFire} 個</strong></p>
              <p>獲得する精錬火晶（期待値）: {res.totalRefine} 個</p>
              <p>貯まるまでの日数: {res.totalDays} 日</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
