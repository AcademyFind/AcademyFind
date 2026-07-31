'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

export function DemographicsCharts({ cityData, deviceData, avgDuration }: { cityData: any[], deviceData: any[], avgDuration: number }) {
    
    // Format duration from seconds to minutes/seconds
    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            
            {/* Average Time Spent Card */}
            <div className="p-6 border border-stone-100 bg-white shadow-sm rounded-2xl flex flex-col items-center justify-center text-center col-span-1 md:col-span-3 lg:col-span-1">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>
                </div>
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Avg Time on Page</p>
                <h3 className="text-4xl font-extrabold text-stone-800 mt-2">{formatDuration(avgDuration)}</h3>
                <p className="text-xs text-stone-400 mt-2">Time spent by users exploring your profile.</p>
            </div>

            {/* Devices Chart */}
            <div className="p-6 border border-stone-100 bg-white shadow-sm rounded-2xl col-span-1 lg:col-span-1 h-[300px] flex flex-col">
                <h3 className="font-bold text-stone-800 mb-4">Visitors by Device</h3>
                <div className="flex-1 w-full h-full min-h-[200px]">
                    {deviceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} Views`, 'Views']} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-stone-400">No device data yet</div>
                    )}
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {deviceData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-1 text-xs text-stone-600 font-medium">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            {entry.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* City Chart */}
            <div className="p-6 border border-stone-100 bg-white shadow-sm rounded-2xl col-span-1 lg:col-span-1 h-[300px] flex flex-col">
                <h3 className="font-bold text-stone-800 mb-4">Top Cities</h3>
                <div className="flex-1 w-full h-full min-h-[200px]">
                    {cityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cityData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f4" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} width={80} />
                                <Tooltip formatter={(value) => [`${value} Views`, 'Views']} cursor={{fill: '#f5f5f4'}} />
                                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24}>
                                    {
                                        cityData.slice(0, 5).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-stone-400">No location data yet</div>
                    )}
                </div>
            </div>

        </div>
    );
}
