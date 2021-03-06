package com.troy.keeper.management.dto;

import com.troy.keeper.hbz.consts.ValidConstants;
import com.troy.keeper.hbz.sys.annotation.Validation;
import com.troy.keeper.hbz.sys.annotation.ValueFormat;
import com.troy.keeper.hbz.type.ExpressCompanyType;
import lombok.Data;

/**
 * Created by leecheng on 2018/1/5.
 */
@Data
public class HbzExpressInvoiceMapDTO extends HbzBaseMapDTO {

    private Long id;

    @ValueFormat(validations = {
            @Validation(use = "cr_order_e", msg = "订单号[{fieldName}]不能为空", format = ValidConstants.NOT_NULL)
    })
    private String orderNo;

    private String orderType;

    @ValueFormat(validations = {
            @Validation(use = "cr_order_e", msg = "快递公司[{fieldName}]为空", format = ValidConstants.NOT_NULL)
    })
    private ExpressCompanyType expressCompanyType;

    @ValueFormat(validations = {
            @Validation(use = "cr_order_e", msg = "快递号[{fieldName}]为空", format = ValidConstants.NOT_NULL)
    })
    private String exNo;

    private String sendTime;

}
