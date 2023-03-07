import { Injectable} from '@nestjs/common';
import { getInactiveUsersData, OrderData } from '../dtos/orderTrendDto';
import { DashboardRepo } from '../repositories/dashboard.repo';
import { NewUserfromdb } from '../dtos/orderTrendDto';
import { NewUser } from '../dtos/orderTrendDto';

@Injectable()
export class OrderTrendService {
  private defaultfrom='2022-10-12';
  private defaultto='2022-1-1';
  constructor(private readonly dashboardRepo : DashboardRepo){}

  async getLastXDays(days : number) : Promise<OrderData[]> {
    return this.dashboardRepo.GetLastDays(days);
  }

  async InactiveUsers(days : number) : Promise<getInactiveUsersData[]> {
    return this.dashboardRepo.GetInactiveUsers(days);
  }

  async NewUsersdata(fromdate: Date, todate: Date):Promise<NewUser[]> {

    const from = fromdate || new Date(this.defaultfrom);
    const to = todate || new Date(this.defaultto);
    const datafromDb:NewUserfromdb[] = await this.dashboardRepo.newuserdatafromdb(fromdate, todate);

    const map = new Map<string, string[]>();

    datafromDb.forEach((obj) => {
      if (map.has(obj.CompanyCreatedTimeStamp)) {
        const temp = map.get(obj.CompanyCreatedTimeStamp);
        temp.push(obj.CompanyName);
        map[obj.CompanyCreatedTimeStamp] = temp;
      } else {
        map.set(obj.CompanyCreatedTimeStamp, [
          obj.CompanyName,
        ]);
      }
    });

    const newUserdata: NewUser[] = [];

    map.forEach((val, key) => {
      newUserdata.push({
        companyCreatedTimeStamp: key,
        namesOfCompanies: val,
        frequency: val.length,
      });
    });
    
    return newUserdata;
  }
}
