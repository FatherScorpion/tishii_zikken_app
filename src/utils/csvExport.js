// CSVエクスポート用のユーティリティ関数

export function downloadCSV(data, filename) {
  // データをCSV形式に変換
  if (!data || data.length === 0) {
    console.error('データが空です');
    return;
  }
  
  // ヘッダー行を取得
  const headers = Object.keys(data[0]);
  
  // BOMを追加してUTF-8を明示（Excel対応）
  const BOM = '\uFEFF';
  
  // CSV文字列を生成
  let csv = BOM + headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // 値にカンマや改行が含まれる場合はダブルクォートで囲む
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
      }
      return stringValue;
    });
    csv += values.join(',') + '\n';
  });
  
  // Blobを作成してダウンロード
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // メモリリークを防ぐためにURLを解放
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

