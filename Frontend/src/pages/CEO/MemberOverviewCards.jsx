import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import MemberCard from "./MemberCard";

export default function MemberOverviewCards() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    axios
      .get("/api/tasks/all-names")
      .then((res) => setMembers(res.data.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading members…</div>;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">All Members</h2>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <MemberCard
            key={member._id}
            member={member}
            isOpen={expandedId === member._id}
            onToggle={() =>
              setExpandedId(expandedId === member._id ? null : member._id)
            }
          />
        ))}
        {members.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8">
            No members found.
          </div>
        )}
      </div>
    </div>
  );
}
