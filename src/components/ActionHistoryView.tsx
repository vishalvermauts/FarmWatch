import React, { useState } from 'react';
import { FarmField, Language, FarmerAction } from '../types/farmwatch';
import { translations, formatDate } from '../utils/i18n';
import { 
  ClipboardList, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface ActionHistoryViewProps {
  selectedField: FarmField;
  onAddAction: (action: FarmerAction) => void;
  language: Language;
}

export const ActionHistoryView: React.FC<ActionHistoryViewProps> = ({
  selectedField,
  onAddAction,
  language,
}) => {
  const t = translations[language];

  const [showAddForm, setShowAddForm] = useState(false);
  const [observationText, setObservationText] = useState('');
  const [actionText, setActionText] = useState('');
  const [outcomeText, setOutcomeText] = useState('');
  const [confirmedState, setConfirmedState] = useState<'confirmed' | 'refuted' | 'inconclusive'>('confirmed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim() || !actionText.trim()) {
      alert('Please fill in both the observation and action taken.');
      return;
    }

    const newAction: FarmerAction = {
      id: `ACT-${Date.now().toString(36).toUpperCase()}`,
      fieldId: selectedField.id,
      seasonId: selectedField.activeSeason.id,
      observedOn: new Date().toISOString().slice(0, 10),
      observation: observationText.trim(),
      actionTaken: actionText.trim(),
      outcome: outcomeText.trim() || undefined,
      alertConcernConfirmed: confirmedState,
      createdAt: new Date().toISOString(),
    };

    onAddAction(newAction);
    setObservationText('');
    setActionText('');
    setOutcomeText('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#536A5B]">
            <span>Closed-Loop Verification</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{selectedField.actions.length} Field Records</span>
            <span aria-hidden="true">·</span>
            <span>Ground Truth</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#14261A] font-display mt-0.5">
            {t.actions.title}
          </h2>
          <p className="text-xs text-[#465A4C] mt-0.5">
            {t.actions.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 self-start md:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.actions.newAction}</span>
        </button>
      </div>

      {/* New Action Log Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#CDE0CC] rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#14261A]">
            Record Field Inspection & Action Taken
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#486350] font-semibold block mb-1">
                {t.actions.observationLabel} *
              </label>
              <textarea
                value={observationText}
                onChange={(e) => setObservationText(e.target.value)}
                placeholder="What did you observe with your eyes? (e.g. soil crusted dry, lower leaves curling, drip emitter silted)..."
                rows={3}
                className="w-full p-2.5 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] text-[#14261A] outline-none focus:border-[#235835]"
                required
              />
            </div>

            <div>
              <label className="text-[#486350] font-semibold block mb-1">
                {t.actions.actionTakenLabel} *
              </label>
              <textarea
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="What corrective action did you take? (e.g. unclogged drippers 12-16, spread paddy straw mulch, adjusted valve pressure)..."
                rows={2}
                className="w-full p-2.5 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] text-[#14261A] outline-none focus:border-[#235835]"
                required
              />
            </div>

            <div>
              <label className="text-[#486350] font-semibold block mb-1">
                Follow-up Outcome (Optional)
              </label>
              <input
                type="text"
                value={outcomeText}
                onChange={(e) => setOutcomeText(e.target.value)}
                placeholder="Observed result after action (e.g. pressure restored to 1.1 bar, will monitor in 48 hours)..."
                className="w-full p-2.5 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] text-[#14261A] outline-none focus:border-[#235835]"
              />
            </div>

            <div>
              <label className="text-[#486350] font-semibold block mb-1.5">
                {t.actions.confirmAlertQuestion}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmedState('confirmed')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    confirmedState === 'confirmed'
                      ? 'bg-[#EAF5E9] border-[#2E7D46] text-[#1D5E32] font-semibold'
                      : 'bg-[#F9FAF8] border-[#D5E0D3] text-[#465A4C]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-[#2E7D46]" />
                  {t.actions.confirmed}
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmedState('refuted')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    confirmedState === 'refuted'
                      ? 'bg-[#FDF2F2] border-[#EF4444] text-[#B91C1C] font-semibold'
                      : 'bg-[#F9FAF8] border-[#D5E0D3] text-[#465A4C]'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 inline mr-1 text-[#EF4444]" />
                  {t.actions.refuted}
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmedState('inconclusive')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    confirmedState === 'inconclusive'
                      ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#B45309] font-semibold'
                      : 'bg-[#F9FAF8] border-[#D5E0D3] text-[#465A4C]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 inline mr-1 text-[#F59E0B]" />
                  {t.actions.inconclusive}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EEF2EC]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs text-[#526D5A] hover:text-[#14261A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* History List */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#14261A]">
          {t.actions.historyHeading}
        </h3>

        {selectedField.actions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6A8171] border border-dashed border-[#DEE6DD] rounded-lg">
            No field actions recorded yet. Walk the field and log physical scouting observations above.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedField.actions.map((act) => (
              <div
                key={act.id}
                className="p-4 bg-[#F9FCF8] rounded-xl border border-[#E3EDE1] space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#EAEFE8] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#14261A]">{act.id}</span>
                    <span aria-hidden="true" className="text-[#899E8F]">·</span>
                    <span className="text-[#556F5D] flex items-center gap-1 font-mono tabular-nums">
                      <Calendar className="w-3 h-3 text-[#235835]" />
                      Observed: {act.observedOn}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold">
                    {act.alertConcernConfirmed === 'confirmed' && (
                      <span className="text-[#2E7D46] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Alert Confirmed on Ground</span>
                      </span>
                    )}
                    {act.alertConcernConfirmed === 'refuted' && (
                      <span className="text-[#B91C1C] flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Alert Refuted (False Positive)</span>
                      </span>
                    )}
                    {act.alertConcernConfirmed === 'inconclusive' && (
                      <span className="text-[#B45309] flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Inconclusive Monitoring</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div>
                    <span className="text-[#657E6D] font-semibold block text-[11px]">Physical Observation:</span>
                    <p className="text-[#14261A] font-medium leading-relaxed">{act.observation}</p>
                  </div>

                  <div>
                    <span className="text-[#657E6D] font-semibold block text-[11px]">Corrective Action:</span>
                    <p className="text-[#235835] font-medium leading-relaxed">{act.actionTaken}</p>
                  </div>

                  {act.outcome && (
                    <div>
                      <span className="text-[#657E6D] font-semibold block text-[11px]">Outcome / Status:</span>
                      <p className="text-[#4E6756] italic">{act.outcome}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
