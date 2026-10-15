"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Users, 
  TrendingUp,
  Target,
  Zap,
  Clock,
  UserCheck,
  CheckCircle2,
  Calendar,
  UserX,
  RefreshCw,
  AlertCircle,
  LayoutDashboard,
  Trash2,
  LogOut,
  Menu,
  FileText
} from "lucide-react";

export default function DashboardConnected() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    passed: 0,
    interview: 0,
    rejected: 0
  });

  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [topPositions, setTopPositions] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [metrics, setMetrics] = useState({
    avgScore: 0,
    passRate: 0,
    avgProcessTime: 0
  });

  // Menu items
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, description: "ภาพรวมและสถิติ" },
    { name: "Candidates", path: "/candidate", icon: Users, description: "รายชื่อผู้สมัคร" },
    { name: "Jobs", path: "/job", icon: FileText, description: "กรอคุณสมบัติ และตำแหน่งงาน" },
    { name: "Trash", path: "/trash", icon: Trash2, description: "ถังขยะ" }
  ];

  const handleLogout = async () => {
    setSidebarOpen(false);
    await signOut({
      callbackUrl: "/signin",  // เปลี่ยนจาก "/" เป็น "/signin"
      redirect: true,
    });
  };

  //  ตรวจสอบ session
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const candidatesRes = await fetch('http://localhost:8080/api/candidates?page=1&limit=1000');
      if (!candidatesRes.ok) throw new Error('ไม่สามารถดึงข้อมูลผู้สมัครได้');
      
      const candidatesData = await candidatesRes.json();
      const candidates = candidatesData.candidates || [];

      const statsData = {
        total: candidates.length,
        pending: candidates.filter(c => c.status === 'pending' || !c.status).length,
        reviewing: candidates.filter(c => c.status === 'reviewing').length,
        passed: candidates.filter(c => c.status === 'passed').length,
        interview: candidates.filter(c => c.status === 'interview').length,
        rejected: candidates.filter(c => c.status === 'rejected').length
      };
      setStats(statsData);

      const scoreRanges = [
        { range: "70-100%", min: 70, max: 100, color: "bg-emerald-500" },
        { range: "50-69%", min: 50, max: 69, color: "bg-blue-500" },
        { range: "30-49%", min: 30, max: 49, color: "bg-yellow-500" },
        { range: "0-29%", min: 0, max: 29, color: "bg-red-500" }
      ];

      const distribution = scoreRanges.map(range => {
        const count = candidates.filter(c => {
          const score = c.matching_score || 0;
          return score >= range.min && score <= range.max;
        }).length;
        
        return {
          ...range,
          count,
          percentage: statsData.total > 0 ? Math.round((count / statsData.total) * 100) : 0
        };
      });
      setScoreDistribution(distribution);

      const positionCounts = {};
      candidates.forEach(c => {
        const pos = c.analyzing_position || 'ไม่ระบุ';
        positionCounts[pos] = (positionCounts[pos] || 0) + 1;
      });

      const topPos = Object.entries(positionCounts)
        .map(([position, count]) => ({
          position,
          count,
          percentage: statsData.total > 0 ? Math.round((count / statsData.total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopPositions(topPos);

      const recent = [...candidates]
        .sort((a, b) => b.id.localeCompare(a.id))
        .slice(0, 5)
        .map(c => ({
          name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'ไม่ระบุชื่อ',
          position: c.analyzing_position || 'ไม่ระบุ',
          score: c.matching_score || 0,
          status: c.status || 'pending',
          time: 'เมื่อสักครู่'
        }));
      setRecentCandidates(recent);

      const scores = candidates.map(c => c.matching_score || 0);
      const avgScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;

      const passRate = statsData.total > 0 
        ? (statsData.passed / statsData.total) * 100 
        : 0;

      setMetrics({
        avgScore: Math.round(avgScore * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        avgProcessTime: 2.3
      });

      setLoading(false);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [fetchDashboardData, status]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "รอตรวจสอบ", icon: Clock },
      reviewing: { bg: "bg-blue-100", text: "text-blue-800", label: "กำลังพิจารณา", icon: UserCheck },
      passed: { bg: "bg-green-100", text: "text-green-800", label: "ผ่าน", icon: CheckCircle2 },
      interview: { bg: "bg-purple-100", text: "text-purple-800", label: "นัดสัมภาษณ์", icon: Calendar },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "ไม่ผ่าน", icon: UserX }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800 font-semibold">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800 font-semibold">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} w-72 flex flex-col`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HR System</h1>
            <p className="text-sm text-gray-600 mt-1">ระบบคัดกรองผู้สมัคร</p>
          </div>
          {/* Toggle button inside sidebar */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <li key={item.path}>
                  <Link href={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50" : "text-gray-700 hover:bg-gray-100"}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className={`text-xs mt-0.5 ${isActive ? "text-blue-100" : "text-gray-500"}`}>{item.description}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
            
            {/* ปุ่มออกจากระบบ */}
            <li>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-semibold">ออกจากระบบ</p>
                  <p className="text-xs mt-0.5 text-red-400">Logout</p>
                </div>
              </button>
            </li>
          </ul>
        </nav>

        <div className="mt-auto"></div>
      </aside>

      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        
        {/* Button to open sidebar when closed (Desktop only) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden lg:block fixed top-4 left-4 z-40 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        )}
        
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 pt-20 lg:pt-6">
          <div className={`mx-auto transition-all duration-300 ${sidebarOpen ? 'max-w-7xl' : 'max-w-full px-4'}`}>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1"></div>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
                <p className="text-gray-600">ภาพรวมระบบคัดกรองผู้สมัครงาน</p>
              </div>
              <div className="flex-1 flex justify-end">
                <button onClick={fetchDashboardData} className="bg-white p-3 rounded-lg border border-gray-200 hover:scale-105 transition-transform">
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-200">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4"><Users className="w-6 h-6 text-blue-600" /></div>
                <p className="text-sm text-gray-600 mb-1">ทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-200">
                <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-4"><Clock className="w-6 h-6 text-yellow-600" /></div>
                <p className="text-sm text-gray-600 mb-1">รอตรวจสอบ</p>
                <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-200">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4"><UserCheck className="w-6 h-6 text-blue-600" /></div>
                <p className="text-sm text-gray-600 mb-1">กำลังพิจารณา</p>
                <p className="text-3xl font-bold text-gray-800">{stats.reviewing}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.total > 0 ? Math.round((stats.reviewing / stats.total) * 100) : 0}%</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-200">
                <div className="bg-green-100 p-3 rounded-lg w-fit mb-4"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
                <p className="text-sm text-gray-600 mb-1">ผ่านการคัดกรอง</p>
                <p className="text-3xl font-bold text-gray-800">{stats.passed}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-200">
                <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4"><Calendar className="w-6 h-6 text-purple-600" /></div>
                <p className="text-sm text-gray-600 mb-1">นัดสัมภาษณ์</p>
                <p className="text-3xl font-bold text-gray-800">{stats.interview}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.total > 0 ? Math.round((stats.interview / stats.total) * 100) : 0}%</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-200">
                <div className="bg-red-100 p-3 rounded-lg w-fit mb-4"><UserX className="w-6 h-6 text-red-600" /></div>
                <p className="text-sm text-gray-600 mb-1">ไม่ผ่าน</p>
                <p className="text-3xl font-bold text-gray-800">{stats.rejected}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%</p>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl w-fit mb-4"><Target className="w-6 h-6 text-white" /></div>
                <p className="text-sm text-gray-600 mb-1">คะแนนเฉลี่ย</p>
                <p className="text-3xl font-bold text-gray-800">{metrics.avgScore}%</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl w-fit mb-4"><TrendingUp className="w-6 h-6 text-white" /></div>
                <p className="text-sm text-gray-600 mb-1">อัตราการผ่าน</p>
                <p className="text-3xl font-bold text-gray-800">{metrics.passRate}%</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-br from-slate-500 to-slate-700 p-3 rounded-xl w-fit mb-4"><Zap className="w-6 h-6 text-white" /></div>
                <p className="text-sm text-gray-600 mb-1">เวลาเฉลี่ย/คน</p>
                <p className="text-3xl font-bold text-gray-800">{metrics.avgProcessTime} <span className="text-lg">วัน</span></p>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              
              {/* Score Distribution - Bar Chart */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">การกระจายคะแนนผู้สมัคร</h2>
                
                <div className="h-64 flex items-end justify-between gap-4">
                  {scoreDistribution.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      {/* Bar */}
                      <div className="w-full bg-gray-100 rounded-t-lg relative flex items-end justify-center" style={{ height: '200px' }}>
                        <div 
                          className={`w-full ${item.color} rounded-t-lg transition-all duration-1000 hover:opacity-80 flex items-end justify-center pb-2`}
                          style={{ height: `${item.percentage > 0 ? Math.max(item.percentage, 5) : 0}%` }}
                        >
                          <span className="text-white font-bold text-sm">{item.count}</span>
                        </div>
                      </div>
                      
                      {/* Label */}
                      <div className="mt-3 text-center">
                        <p className="text-xs font-semibold text-gray-700">{item.range}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Positions - Horizontal Bar Chart */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">ตำแหน่งที่สมัครมากที่สุด</h2>
                <div className="space-y-4">
                  {topPositions.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">{index + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">{item.position}</span>
                          <span className="text-sm font-bold text-gray-800">{item.count} คน</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: `${Math.min(item.percentage * 2, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Status Breakdown - Donut Chart Style */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">สถานะผู้สมัครทั้งหมด</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Pending */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle 
                          cx="48" cy="48" r="40" 
                          stroke="#eab308" 
                          strokeWidth="8" 
                          fill="none"
                          strokeDasharray={`${(stats.pending / stats.total * 251.2)} 251.2`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-800">{stats.pending}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">รอตรวจสอบ</p>
                    <p className="text-xs text-gray-500">{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%</p>
                  </div>

                  {/* Reviewing */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle 
                          cx="48" cy="48" r="40" 
                          stroke="#3b82f6" 
                          strokeWidth="8" 
                          fill="none"
                          strokeDasharray={`${(stats.reviewing / stats.total * 251.2)} 251.2`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-800">{stats.reviewing}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">กำลังพิจารณา</p>
                    <p className="text-xs text-gray-500">{stats.total > 0 ? Math.round((stats.reviewing / stats.total) * 100) : 0}%</p>
                  </div>

                  {/* Passed */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle 
                          cx="48" cy="48" r="40" 
                          stroke="#22c55e" 
                          strokeWidth="8" 
                          fill="none"
                          strokeDasharray={`${(stats.passed / stats.total * 251.2)} 251.2`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-800">{stats.passed}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">ผ่านการคัดกรอง</p>
                    <p className="text-xs text-gray-500">{stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%</p>
                  </div>

                  {/* Interview */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle 
                          cx="48" cy="48" r="40" 
                          stroke="#a855f7" 
                          strokeWidth="8" 
                          fill="none"
                          strokeDasharray={`${(stats.interview / stats.total * 251.2)} 251.2`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-800">{stats.interview}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">นัดสัมภาษณ์</p>
                    <p className="text-xs text-gray-500">{stats.total > 0 ? Math.round((stats.interview / stats.total) * 100) : 0}%</p>
                  </div>

                  {/* Rejected */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle 
                          cx="48" cy="48" r="40" 
                          stroke="#ef4444" 
                          strokeWidth="8" 
                          fill="none"
                          strokeDasharray={`${(stats.rejected / stats.total * 251.2)} 251.2`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-800">{stats.rejected}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">ไม่ผ่าน</p>
                    <p className="text-xs text-gray-500">{stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Candidates */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6">{'ผู้สมัครล่าสุด'}</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ชื่อ-นามสกุล</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ตำแหน่ง</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">คะแนน</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCandidates.length > 0 ? recentCandidates.map((candidate, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 cursor-pointer">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                              {candidate.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-800">{candidate.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{candidate.position}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                            candidate.score >= 70 ? 'bg-green-100 text-green-800' :
                            candidate.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>{candidate.score}%</span>
                        </td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(candidate.status)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="py-8 text-center text-gray-600">ไม่พบข้อมูลผู้สมัคร</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}