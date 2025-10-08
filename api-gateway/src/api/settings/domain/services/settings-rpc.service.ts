import { SettingsDatasource } from '../datasources/settings.datasource';

export class SettingsRpcService {
  constructor(private readonly datasource: SettingsDatasource) {}

  async deleteData() {
    return await this.datasource.deleteData();
  }
}
