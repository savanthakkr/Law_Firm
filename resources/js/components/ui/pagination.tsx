/**
 * Pagination component with dark mode support
 */
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  from?: number;
  to?: number;
  total?: number;
  links?: any[];
  currentPage?: number;
  lastPage?: number;
  entityName?: string;
  onPageChange?: (url: string) => void;
  className?: string;
}

export function Pagination({
  from = 0,
  to = 0,
  total = 0,
  links = [],
  currentPage,
  lastPage,
  entityName = 'items',
  onPageChange,
  className = '',
}: PaginationProps) {
  const { t } = useTranslation();

  const handlePageChange = (url: string) => {
    if (onPageChange) {
      onPageChange(url);
    } else if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className={cn(
      "p-4 border-t dark:border-gray-700 flex items-center justify-between dark:bg-gray-900",
      className
    )}>
      <div className="text-sm text-muted-foreground dark:text-gray-300">
        {t("Showing")} <span className="font-medium dark:text-white">{from}</span> {t("to")}{" "}
        <span className="font-medium dark:text-white">{to}</span> {t("of")}{" "}
        <span className="font-medium dark:text-white">{total}</span> {entityName}
      </div>

      <div className="flex gap-1">
        {links && links.length > 0 ? (
          (() => {
            const prevLink = links.find(link => link.label === "&laquo; Previous");
            const nextLink = links.find(link => link.label === "Next &raquo;");
            const pageLinks = links.filter(link => 
              link.label !== "&laquo; Previous" && link.label !== "Next &raquo;"
            );
            
            const currentPageIndex = pageLinks.findIndex(link => link.active);
            const totalPages = pageLinks.length;
            
            let visiblePages = [];
            
            if (totalPages <= 4) {
              visiblePages = pageLinks;
            } else {
              const current = currentPageIndex + 1;
              
              if (current <= 2) {
                // Show: 1 2 3 ... last
                visiblePages = [
                  ...pageLinks.slice(0, 3),
                  { label: '...', disabled: true },
                  pageLinks[totalPages - 1]
                ];
              } else if (current >= totalPages - 1) {
                // Show: 1 ... last-2 last-1 last
                visiblePages = [
                  pageLinks[0],
                  { label: '...', disabled: true },
                  ...pageLinks.slice(totalPages - 3)
                ];
              } else {
                // Show: 1 ... current-1 current current+1 ... last
                visiblePages = [
                  pageLinks[0],
                  { label: '...', disabled: true },
                  pageLinks[currentPageIndex - 1],
                  pageLinks[currentPageIndex],
                  pageLinks[currentPageIndex + 1],
                  { label: '...', disabled: true },
                  pageLinks[totalPages - 1]
                ];
              }
            }
            
            return [
              // Previous button
              prevLink && (
                <Button
                  key="prev"
                  variant="outline"
                  size="sm"
                  className="px-3"
                  disabled={!prevLink.url}
                  onClick={() => prevLink.url && handlePageChange(prevLink.url)}
                >
                  {t("Previous")}
                </Button>
              ),
              // Page numbers with ellipsis
              ...visiblePages.map((link: any, i: number) => {
                if (link.label === '...') {
                  return (
                    <span key={`ellipsis-${i}`} className="px-2 py-1 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                
                return (
                  <Button
                    key={`page-${i}-${link.label}`}
                    variant={link.active ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    disabled={!link.url}
                    onClick={() => link.url && handlePageChange(link.url)}
                  >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                  </Button>
                );
              }),
              // Next button
              nextLink && (
                <Button
                  key="next"
                  variant="outline"
                  size="sm"
                  className="px-3"
                  disabled={!nextLink.url}
                  onClick={() => nextLink.url && handlePageChange(nextLink.url)}
                >
                  {t("Next")}
                </Button>
              )
            ].filter(Boolean);
          })()
        ) : (
          // Simple pagination if links are not available
          currentPage && lastPage && lastPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(`?page=${currentPage - 1}`)}
              >
                {t("Previous")}
              </Button>
              <span className="px-3 py-1 dark:text-white">
                {currentPage} of {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= lastPage}
                onClick={() => handlePageChange(`?page=${currentPage + 1}`)}
              >
                {t("Next")}
              </Button>
            </>
          )
        )}
      </div>
    </div>
  );
}