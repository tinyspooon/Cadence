'use client'

import { cn } from '@/lib/utils'

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  approved: 'Approved',
  posted: 'Posted',
}

const demoFeedData = [
  { id: 'f-a1', date: 'Today', platform: 'linkedin', isX: false, status: 'approved', topic: 'SDR coaching', style: 'Story', full: "I've managed SDR teams long enough to know this:\n\nThe reps who hit quota consistently aren't the ones with the best pitch.\n\nThey're the ones who do the work nobody else wants to do — the research, the follow-up, the patience.\n\nMost people optimise for looking productive. The best reps optimise for being effective." },
  { id: 'f-s1', date: 'Tomorrow · May 8', platform: 'linkedin', isX: false, status: 'scheduled', topic: 'Cold outreach', style: 'Story', full: 'The cold email mistake everyone makes — and how to stop it.\n\nMost cold emails talk about the sender, not the reader.\n\n"We help companies like yours..." — who cares? You haven\'t earned that yet.\n\nStart with their world. Reference something specific. Make them feel seen.\n\nThen — and only then — tell them what you do.' },
  { id: 'f-s2', date: 'Wed · May 8', platform: 'x', isX: true, status: 'scheduled', topic: 'Sales leadership', style: 'Observation', full: 'SDR metrics that actually matter vs ones that sound good.\n\nMatters: Pipeline created, SAO rate, avg deal size sourced.\nSounds good: Dials, emails sent, activities logged.\n\nYour CRO doesn\'t care how busy your team looks.' },
  { id: 'f-s3', date: 'Thu · May 9', platform: 'linkedin', isX: false, status: 'scheduled', topic: 'Pipeline strategy', style: 'Story', full: 'What 3 months of multi-threading taught me about patience.\n\nWe touched 6 stakeholders before the deal closed. Some took 8 follow-ups. One ghosted for 3 weeks and came back with budget.\n\nThe rep who wanted to "just move on" after week 4 — he\'s glad he didn\'t.' },
  { id: 'f-s4', date: 'Fri · May 10', platform: 'linkedin', isX: false, status: 'scheduled', topic: 'Sales leadership', style: 'Insight', full: "Pipeline is a lagging indicator. Here's what I actually watch.\n\nBy the time pipeline looks bad, it's already too late.\n\nI watch: ICP account coverage, meaningful conversation rate, and rep response time on inbound signals.\n\nThose three numbers predict pipeline 6 weeks out." },
  { id: 'f-s5', date: 'Mon · May 12', platform: 'x', isX: true, status: 'scheduled', topic: 'SDR coaching', style: 'Observation', full: 'Hot take: the SDR to AE handoff is where most deals die.\n\nNot bad prospecting. Not bad demos. The handoff.\n\nFix your internal communication before blaming the market.' },
  { id: 'f-d1', date: 'May 14', platform: 'linkedin', isX: false, status: 'draft', topic: 'Pipeline strategy', style: 'Story', full: 'Most sales leaders track the wrong pipeline metric. Here\'s what actually predicts your quarter...' },
  { id: 'f-d2', date: 'May 16', platform: 'x', isX: true, status: 'draft', topic: 'Cold outreach', style: 'Observation', full: 'A cold email that opens with "I hope this finds you well" has already lost. Here\'s why...' },
  { id: 'f-p1', date: 'May 5', platform: 'linkedin', isX: false, status: 'posted', topic: 'Sales leadership', style: 'Story', full: "Why I hire for curiosity over experience in SDR roles.\n\nI've interviewed hundreds of SDR candidates. The ones who stand out aren't the ones with the best CV.\n\nThey're the ones who ask the best questions." },
  { id: 'f-p2', date: 'May 2', platform: 'linkedin', isX: false, status: 'posted', topic: 'Pipeline strategy', style: 'Insight', full: 'The pipeline metric everyone ignores: ICP account coverage.\n\nEvery team tracks pipeline created. Almost no team tracks what percentage of their Tier 1 ICP accounts have had a meaningful conversation in the last 90 days.' },
]

export { statusLabels, demoFeedData }
