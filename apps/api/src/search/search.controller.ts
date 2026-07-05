import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across family members and medications' })
  @ApiQuery({ name: 'familyId', required: true })
  @ApiQuery({ name: 'q', required: true, description: 'Search query string' })
  @ApiResponse({ status: 200, description: 'Search results returned' })
  async search(
    @Query('familyId') familyId: string,
    @Query('q') query: string,
  ) {
    return this.searchService.globalSearch(familyId, query);
  }
}
