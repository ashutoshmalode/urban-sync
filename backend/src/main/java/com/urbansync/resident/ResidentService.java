package com.urbansync.resident;

public interface ResidentService {
    ResidentDTO getByMobile(String mobile);
    
    ResidentDTO getByMobileAndFlat(String mobile, String flatNumber);
}