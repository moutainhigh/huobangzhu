package com.troy.keeper.hbz.app.dto;

import lombok.Data;

import java.util.List;

/**
 * Created by leecheng on 2017/11/30.
 */
@Data
public class HbzBaseMapDTO {
    
    private Long createdDate;
    private Long createdDateLT;
    private Long createdDateLE;
    private Long createdDateGT;
    private Long createdDateGE;
    private String status;
    private List<String> statuses;
    private Integer page = 0;
    private Integer size = 11;
    private List<String[]> sorts;
    private String secret;
    private String body;
    private String sign;
    private String authCode;
    private Boolean updateNull = true;
}
