import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './project.entity';
import { CreateProjectDto, QueryProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId?: string): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      userId,
      status: createProjectDto.status || ProjectStatus.CONSTRUCTING,
      paymentTerms: createProjectDto.paymentTerms || [],
      specialOffers: createProjectDto.specialOffers || [],
      amenities: createProjectDto.amenities || [],
      galleryImages: createProjectDto.galleryImages || [],
      floorPlans: createProjectDto.floorPlans || [],
      reels: createProjectDto.reels || [],
    });
    return this.projectsRepository.save(project);
  }

  async findAll(query: QueryProjectDto) {
    const qb = this.projectsRepository.createQueryBuilder('project');

    if (query.search && query.search.trim()) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        '(project.name ILIKE :search OR project.developerName ILIKE :search OR project.tagline ILIKE :search OR project.description ILIKE :search OR project.district ILIKE :search OR project.khoroo ILIKE :search OR project.addressDetail ILIKE :search)',
        { search },
      );
    }

    if (query.district && query.district !== 'Бүгд' && query.district !== 'All') {
      qb.andWhere('project.district ILIKE :district', { district: `%${query.district}%` });
    }

    if (query.status && query.status !== 'ALL') {
      qb.andWhere('project.status = :status', { status: query.status });
    }

    if (query.minPricePerSqm !== undefined && query.minPricePerSqm !== null && !isNaN(Number(query.minPricePerSqm))) {
      qb.andWhere('project.minPricePerSqm >= :minPricePerSqm', { minPricePerSqm: Number(query.minPricePerSqm) });
    }

    if (query.maxPricePerSqm !== undefined && query.maxPricePerSqm !== null && !isNaN(Number(query.maxPricePerSqm))) {
      qb.andWhere('project.minPricePerSqm <= :maxPricePerSqm', { maxPricePerSqm: Number(query.maxPricePerSqm) });
    }

    if (query.minPrice !== undefined && query.minPrice !== null && !isNaN(Number(query.minPrice))) {
      qb.andWhere('project.startingPrice >= :minPrice', { minPrice: Number(query.minPrice) });
    }

    if (query.maxPrice !== undefined && query.maxPrice !== null && !isNaN(Number(query.maxPrice))) {
      qb.andWhere('project.startingPrice <= :maxPrice', { maxPrice: Number(query.maxPrice) });
    }

    if (String(query.has3dTour) === 'true') {
      qb.andWhere("project.tour3dUrl IS NOT NULL AND project.tour3dUrl != ''");
    }

    if (String(query.has6PercentLoan) === 'true') {
      qb.andWhere("(project.paymentTerms ILIKE '%6%%' OR project.paymentTerms ILIKE '%Ипотек%')");
    }

    qb.orderBy('project.isFeatured', 'DESC');
    qb.addOrderBy('project.createdAt', 'DESC');

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Төсөл олдсонгүй');
    }
    // Increment view count
    await this.projectsRepository.increment({ id }, 'viewsCount', 1);
    return project;
  }

  async update(id: string, updateProjectDto: Partial<CreateProjectDto>, userId?: string): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectsRepository.remove(project);
  }

  async seedDemoProjectsIfEmpty() {
    const existing = await this.projectsRepository.find();
    if (existing.length > 0) {
      // If existing demo projects don't have reels, enrich them
      for (const p of existing) {
        let changed = false;
        if (!p.videoUrl) {
          p.videoUrl = p.name.includes('Sky')
            ? 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-with-plants-41617-large.mp4'
            : 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-modern-interior-41618-large.mp4';
          changed = true;
        }
        if (!p.reels || p.reels.length === 0) {
          p.reels = [
            {
              title: `${p.name} — Пентхаус үзлэг & Панорама`,
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-with-plants-41617-large.mp4',
              thumbnailUrl: p.coverImage,
              durationSeconds: 15,
            },
            {
              title: `${p.name} — Хотхоны тохижилт & Ногоон төгөл`,
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-modern-interior-41618-large.mp4',
              thumbnailUrl: p.galleryImages?.[0] || p.coverImage,
              durationSeconds: 20,
            },
            {
              title: `${p.name} — Мастер унтлагын өрөө & Ухаалаг систем`,
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-white-kitchen-counter-with-appliances-41619-large.mp4',
              thumbnailUrl: p.galleryImages?.[1] || p.coverImage,
              durationSeconds: 18,
            },
          ];
          changed = true;
        }
        if (changed) {
          await this.projectsRepository.save(p);
        }
      }
      return;
    }

    const demoProjects: Partial<Project>[] = [
      {
        name: 'River Garden II Residence',
        developerName: 'Эко Констракшн ХХК',
        tagline: 'Хатан Туул голын хөвөөнд сүндэрлэх 5 одтой тансаг зэрэглэлийн хотхон',
        description: 'River Garden II хотхон нь Улаанбаатар хотын хамгийн цэнгэг агаартай бүс Хан-Уул дүүрэгт байрлах бөгөөд ногоон байгууламж, 3D аялал, ухаалаг смарт гэрийн системээр бүрэн тоноглогдсон.',
        status: ProjectStatus.READY_TO_MOVE,
        completionYearQuarter: 'Ашиглалтад орсон',
        city: 'Улаанбаатар',
        district: 'Хан-Уул',
        khoroo: '11-р хороо',
        addressDetail: 'Маршалын гүүрний баруун урд талд, Туул голын эрэг дээр',
        latitude: 47.8864,
        longitude: 106.9056,
        salesPhone: '7711-8899, 9911-0022',
        salesEmail: 'sales@rivergarden.mn',
        websiteUrl: 'https://vmax.mn',
        facebookPageUrl: 'https://facebook.com/rivergarden.mn',
        instagramHandle: 'https://instagram.com/rivergarden_official',
        viberOrTelegramUrl: 'https://t.me/vmax_properties',
        minPricePerSqm: 4200000,
        maxPricePerSqm: 5500000,
        startingPrice: 280000000,
        paymentTerms: ['Банкны 6% зээл', 'Компанийн 3 жилийн хувь лизинг', 'Урьдчилгаа 20%', 'Бартер (Автомашин)'],
        specialOffers: ['Гал тогооны тавилга 100% бэлгэнд', 'Урьдчилгаа 50% төлөөд 5% хөнгөлөлт'],
        amenities: ['🌳 Ногоон байгууламж 70%', '🏊 Дотор усан бассейн', '🛡️ 24/7 харуул хамгаалалт', '⚡ Смарт систем', '🏫 Сургууль, цэцэрлэгт ойр'],
        tour3dUrl: 'https://my.matterport.com/show/?m=JGPnGQ6hosj&play=1',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-modern-interior-41618-large.mp4',
        coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        ],
        reels: [
          {
            title: 'River Garden II — Тансаг орчин & Загварын байр',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-modern-interior-41618-large.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
            durationSeconds: 15,
          },
          {
            title: 'Хүүхдийн эко тоглоомын талбай & Усан бассейн',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-white-kitchen-counter-with-appliances-41619-large.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
            durationSeconds: 20,
          },
        ],
        floorPlans: [
          {
            title: '2 өрөө — А загвар',
            rooms: 2,
            areaSqm: 58.5,
            pricePerSqm: 4200000,
            startingPrice: 245700000,
            image2dUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
            availableCount: 4,
            description: 'Мастер унтлагын өрөөтэй, наран тал руу харсан цонхтой тав тухтай зохион байгуулалт.',
          },
          {
            title: '3 өрөө — Luxury B загвар',
            rooms: 3,
            areaSqm: 88.2,
            pricePerSqm: 4400000,
            startingPrice: 388080000,
            image2dUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
            availableCount: 2,
            description: '2 ариун цэврийн өрөө, хувцасны өрөө, өргөн уудам зочны өрөөтэй.',
          },
        ],
        isFeatured: true,
      },
      {
        name: 'Sky Garden Residence Tower',
        developerName: 'Мандала Проперти ХХК',
        tagline: 'Ирээдүйг тодорхойлох өндөр зэрэглэлийн бизнес орон сууц',
        description: 'Үзэмжит Зайсан толгой болон Их тэнгэрийн аманд байрлах тансаг шийдэл. Дэлхийн тэргүүлэгч брэндүүдийн тоноглолтой.',
        status: ProjectStatus.CONSTRUCTING,
        completionYearQuarter: '2026 Q4',
        city: 'Улаанбаатар',
        district: 'Хан-Уул',
        khoroo: '15-р хороо',
        addressDetail: 'Хүүхдийн паркийн урд, Нарны зам дагуу',
        latitude: 47.9124,
        longitude: 106.9206,
        salesPhone: '7788-9900, 8800-1122',
        salesEmail: 'info@skygarden.mn',
        websiteUrl: 'https://vmax.mn',
        facebookPageUrl: 'https://facebook.com/skygarden.residence',
        instagramHandle: 'https://instagram.com/skygarden_tower',
        viberOrTelegramUrl: 'https://t.me/vmax_properties',
        minPricePerSqm: 3800000,
        maxPricePerSqm: 4900000,
        startingPrice: 190000000,
        paymentTerms: ['Банкны 6% зээл', 'Урьдчилгаа 15%', 'Хувь лизинг 5 жил', 'Бартер сонсоно'],
        specialOffers: ['Эрт захиалгын 7% хөнгөлөлт', 'Дулаан зогсоол 50% хямдрал'],
        amenities: ['🏋️ Фитнесс клуб', '🚗 2 давхар дулаан зогсоол', '🧸 Дотор тоглоомын төв', '🛡️ Царай таних систем'],
        tour3dUrl: 'https://my.matterport.com/show/?m=JGPnGQ6hosj&play=1',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-with-plants-41617-large.mp4',
        coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
        ],
        reels: [
          {
            title: 'Sky Garden Tower — Пентхаус панорама тойм',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-with-plants-41617-large.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
            durationSeconds: 15,
          },
          {
            title: 'Ухаалаг интерьер шийдэл & Фитнесс төв',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-modern-interior-41618-large.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
            durationSeconds: 22,
          },
        ],
        floorPlans: [
          {
            title: '1 өрөө Studio',
            rooms: 1,
            areaSqm: 42.0,
            pricePerSqm: 3800000,
            startingPrice: 159600000,
            image2dUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
            availableCount: 7,
          },
          {
            title: '2 өрөө Cozy',
            rooms: 2,
            areaSqm: 63.5,
            pricePerSqm: 3900000,
            startingPrice: 247650000,
            image2dUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
            availableCount: 5,
          },
        ],
        isFeatured: true,
      },
    ];

    for (const p of demoProjects) {
      await this.projectsRepository.save(this.projectsRepository.create(p));
    }
  }
}
