import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Phone,
  MessageSquare,
  Award,
  Plus,
  CheckCircle2,
  Star,
  Building,
} from 'lucide-react';
import { AgentInfo } from '../../types';

interface AdminAgentsManagerProps {
  agents: AgentInfo[];
  onAddAgent?: (agent: AgentInfo) => void;
}

export const AdminAgentsManager: React.FC<AdminAgentsManagerProps> = ({ agents }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003527]/10 text-[#003527] text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            Field Personnel & Certified Advisors
          </div>
          <h1 className="font-playfair text-2xl font-bold text-[#003527]">
            Certified Inspection Engineers & Advisors
          </h1>
          <p className="text-xs text-[#707974] mt-0.5">
            Port Harcourt certified structural auditors, cadastral survey reviewers, and luxury residential specialists.
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id || agent.name}
            className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs hover:border-[#003527]/50 hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-16 h-16 rounded-2xl object-cover border border-[#bfc9c3]/50 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#735c00] bg-[#fed65b]/20 px-2 py-0.5 rounded-md">
                    {agent.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#003527]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {agent.rating || 4.9}
                  </div>
                </div>
                <h3 className="font-playfair text-lg font-bold text-[#1b1c1c] mt-1 truncate">
                  {agent.name}
                </h3>
                <p className="text-xs text-[#707974]">{agent.role}</p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3 bg-[#fbf9f8] p-3 rounded-xl border border-[#bfc9c3]/30 text-xs">
              <div>
                <span className="text-[#707974] block">Active Listings</span>
                <strong className="font-playfair text-base text-[#003527]">
                  {agent.activeListings || 8} Units
                </strong>
              </div>
              <div>
                <span className="text-[#707974] block">Completed Audits</span>
                <strong className="font-playfair text-base text-[#735c00]">
                  {agent.completedAudits || 40}+ Verified
                </strong>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="pt-2 border-t border-[#bfc9c3]/20 flex items-center justify-between gap-3 text-xs">
              <a
                href={`https://wa.me/${agent.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </a>
              <a
                href={`tel:${agent.phone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1b1c1c] font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call Advisor
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
