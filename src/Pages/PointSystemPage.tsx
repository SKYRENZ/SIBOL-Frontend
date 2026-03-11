import SuperAdminHeader from "../Components/SuperAdminHeader";
import PointSystem from "../Components/Household/pointSystem";

export default function PointSystemPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      <div className="w-full bg-white">
        {/* spacer to avoid header overlap */}
        <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />
      </div>
      <PointSystem />
    </div>
  );
}
