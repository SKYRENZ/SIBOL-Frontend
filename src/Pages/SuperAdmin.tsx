import SuperAdminHeader from '../Components/SuperAdminHeader';

export default function SuperAdmin() {
    return (
        <>
            <SuperAdminHeader />
            <div className="w-full bg-white">
                {/* spacer to avoid header overlap */}
                <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />

                {/* SUBHEADER */}
                <div
                    className="subheader sticky z-30 w-full bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm"
                    style={{ top: 'calc(var(--header-height, 72px) + 8px)' }}
                >
                    <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                        <h1 className="text-xl sm:text-2xl font-semibold text-sibol-green">
                            SuperAdmin
                        </h1>
                        {/* buttons will be added later */}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="w-full bg-white mt-3">
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <p className="text-gray-500 text-sm">
                            SuperAdmin dashboard — functionality coming soon.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
