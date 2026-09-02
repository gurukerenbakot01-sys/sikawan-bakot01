import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  ChevronDown, 
  BadgeCheck, 
  Briefcase, 
  IdCard, 
  RefreshCw, 
  Plus, 
  Sparkles,
  School
} from 'lucide-react';
import { Guru } from '../types';

interface LeftPanelTeacherProps {
  guruList: Guru[];
  selectedGuru: Guru;
  onSelectGuru: (guru: Guru) => void;
  onSyncFromSheet?: () => void;
  isSyncingTeachers?: boolean;
}

export const LeftPanelTeacher: React.FC<LeftPanelTeacherProps> = ({
  guruList,
  selectedGuru,
  onSelectGuru,
  onSyncFromSheet,
  isSyncingTeachers = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filtered guru based on search term
  const filteredGuru = guruList.filter((g) => {
    const q = searchTerm.toLowerCase();
    return (
      g.nama.toLowerCase().includes(q) ||
      g.nip.toLowerCase().includes(q) ||
      g.jabatan.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 transition-all">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              1. Data Guru Pengirim
            </h2>
            <p className="text-xs text-slate-500">
              Database SD Negeri Babelan Kota 01 (Google Spreadsheet)
            </p>
          </div>
        </div>

        {onSyncFromSheet && (
          <button
            type="button"
            onClick={onSyncFromSheet}
            disabled={isSyncingTeachers}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
            title="Sinkronkan data guru terbaru dari Google Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTeachers ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sinkronkan Sheets</span>
          </button>
        )}
      </div>

      {/* Select Teacher Control with Searchable Dropdown */}
      <div className="relative mb-4">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Pilih Guru / Tenaga Pendidik
        </label>
        
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl text-left transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          <div className="truncate pr-2">
            <span className="font-bold text-slate-900 text-sm">{selectedGuru.nama}</span>
            <span className="text-slate-500 text-xs ml-2">({selectedGuru.jabatan})</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-hidden flex flex-col">
            {/* Search Box inside dropdown */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama guru, NIP, atau jabatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            {/* List items */}
            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {filteredGuru.length > 0 ? (
                filteredGuru.map((guru) => (
                  <button
                    key={guru.id}
                    type="button"
                    onClick={() => {
                      onSelectGuru(guru);
                      setIsDropdownOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-start justify-between gap-2 hover:bg-emerald-50/60 transition-colors ${
                      guru.id === selectedGuru.id ? 'bg-emerald-50 text-emerald-900' : 'text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {guru.nama}
                        {guru.id === selectedGuru.id && (
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        NIP: <span className="font-mono">{guru.nip}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 whitespace-nowrap">
                      {guru.jabatan}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Tidak ditemukan guru dengan kata kunci "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Teacher Detailed Identity Card */}
      <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-xl p-4 border border-emerald-100/80">
        <div className="flex items-start gap-3">
          {/* Avatar with initials */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
            {selectedGuru.nama
              .replace(/^(Hj\.|H\.|Drs\.|Dr\.)\s*/i, '')
              .substring(0, 2)
              .toUpperCase()}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {selectedGuru.nama}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                selectedGuru.statusKepegawaian === 'PNS' 
                  ? 'bg-blue-100 text-blue-800'
                  : selectedGuru.statusKepegawaian === 'PPPK'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedGuru.statusKepegawaian || 'PNS'}
              </span>
            </div>

            <div className="mt-2 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <IdCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">NIP:</span>
                <span className="font-mono font-medium text-slate-800">{selectedGuru.nip}</span>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Jabatan:</span>
                <span className="font-medium text-slate-800 truncate">{selectedGuru.jabatan}</span>
              </div>

              {selectedGuru.golongan && (
                <div className="flex items-center gap-2">
                  <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Pangkat/Gol:</span>
                  <span className="text-slate-700">{selectedGuru.golongan}</span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Database Status Tag */}
        <div className="mt-3 pt-2.5 border-t border-emerald-100/60 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
            Terdaftar di Database Google Sheets
          </span>
          <span className="text-slate-400">Unit: SDN Babelan Kota 01</span>
        </div>
      </div>
    </div>
  );
};
