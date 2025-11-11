import { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Patent {
  id: string;
  patent_number: string;
  patent_title: string;
  assignee: string | null;
  filing_date: string | null;
  conflict_severity: number | null;
  claim_overlap_percentage: number | null;
}

interface ConflictingPatentsTableProps {
  patents: Patent[];
  onViewClaimChart: (patent: Patent) => void;
}

export function ConflictingPatentsTable({ patents, onViewClaimChart }: ConflictingPatentsTableProps) {
  const [sortField, setSortField] = useState<keyof Patent>('conflict_severity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'bg-destructive';
    if (severity >= 5) return 'bg-warning';
    return 'bg-success';
  };

  const handleSort = (field: keyof Patent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredPatents = patents.filter(
    (p) =>
      p.patent_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patent_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPatents = [...filteredPatents].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    if (aVal === bVal) return 0;
    const comparison = aVal > bVal ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const paginatedPatents = sortedPatents.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sortedPatents.length / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search by patent number, title, or assignee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('patent_number')} className="cursor-pointer">
                Patent Number {sortField === 'patent_number' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('patent_title')} className="cursor-pointer">
                Title {sortField === 'patent_title' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('assignee')} className="cursor-pointer">
                Assignee {sortField === 'assignee' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('filing_date')} className="cursor-pointer">
                Filing Date {sortField === 'filing_date' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('conflict_severity')} className="cursor-pointer">
                Severity {sortField === 'conflict_severity' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('claim_overlap_percentage')} className="cursor-pointer">
                Claim Overlap {sortField === 'claim_overlap_percentage' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPatents.map((patent) => (
              <TableRow key={patent.id}>
                <TableCell className="font-mono text-sm">{patent.patent_number}</TableCell>
                <TableCell className="max-w-xs truncate" title={patent.patent_title}>
                  {patent.patent_title}
                </TableCell>
                <TableCell>{patent.assignee || 'N/A'}</TableCell>
                <TableCell>{patent.filing_date ? new Date(patent.filing_date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 rounded-full ${getSeverityColor(patent.conflict_severity || 0)}`} style={{ width: `${(patent.conflict_severity || 0) * 10}%` }} />
                    <span className="text-sm font-medium">{patent.conflict_severity || 0}/10</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={patent.claim_overlap_percentage || 0} className="h-2" />
                    <span className="text-xs text-muted-foreground">{patent.claim_overlap_percentage || 0}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewClaimChart(patent)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, sortedPatents.length)} of {sortedPatents.length} patents
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
