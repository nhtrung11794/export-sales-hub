'use client';

import React from 'react';
import M02_B03_FactCheck from '../M02_B03_FactCheck';
import M02_B04_ICP_BuyerMap from '../M02_B04_ICP_BuyerMap';
import M02_B05_DiscoveryNote from '../M02_B05_DiscoveryNote';

export default function M02_CombinedForm() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Hướng dẫn Module 02:
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Hãy hoàn thành lần lượt các bước dưới đây để xác thực thông tin thị trường mục tiêu, 
          xây dựng chân dung khách hàng lý tưởng (ICP) và định hình nhu cầu cốt lõi. 
          Các thông tin bạn nhập sẽ tự động được lưu trữ (Auto-save) và kế thừa cho Module 03.
        </p>
      </div>
      
      {/* Block B03 */}
      <M02_B03_FactCheck />
      
      {/* Block B04 */}
      <M02_B04_ICP_BuyerMap />
      
      {/* Block B05 */}
      <M02_B05_DiscoveryNote />
    </div>
  );
}
