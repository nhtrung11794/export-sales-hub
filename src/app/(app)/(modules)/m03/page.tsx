import ModuleLayout from '@/components/layout/ModuleLayout';
import M3_FitScoreForm from '@/components/modules/m03/M3_FitScoreForm';

export default function Module03Page() {
  return (
    <ModuleLayout
      moduleTitle="Module 03: Phát triển cơ hội & Quản trị Pipeline"
      learningContent={
        <div className="space-y-4">
          <p className="text-gray-300">
            Dựa vào chân dung khách hàng lý tưởng (ICP) từ M02, hãy đánh giá cơ hội bằng Fit Score.
          </p>
          <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
            <h3 className="font-semibold text-blue-400 mb-2">Tiêu chí BANT/MEDDIC</h3>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              <li>Fit (Độ phù hợp)</li>
              <li>Need (Nhu cầu thực tế)</li>
              <li>Access (Quyền quyết định)</li>
              <li>Criteria (Tiêu chuẩn kỹ thuật)</li>
              <li>Momentum (Động lực)</li>
            </ul>
          </div>
        </div>
      }
      formContent={<M3_FitScoreForm />}
      aiTutorContent={
        <div className="text-sm text-gray-400">
          <p>Prompt Gợi ý:</p>
          <div className="mt-2 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
            "Đóng vai Giám đốc Mua hàng, hãy phản biện giúp tôi các rủi ro nếu Fit Score của tôi đang ở mức Warning."
          </div>
        </div>
      }
    />
  );
}
